const predef = require("./tools/predef");
const meta = require("./tools/meta");
const MMA = require("./tools/MMA");
const trueRange = require("./tools/trueRange");
const WMA = require("./tools/WMA");

class OGCHkeltnerChannelsN {
    init() {
        this.atr = MMA(this.props.atrPeriod);
        const period = this.props.period;
        this.wmaLong = WMA(period);
        this.wmaShort = WMA(period / 2);
        this.wmaSqrt = WMA(Math.sqrt(period));
    }

    map(d, i, history) {
        const open = d.open();
        const value = d.close();
        const wmaLong = this.wmaLong(value);
        const wmaShort = this.wmaShort(value) * 2;
        const wmaDiff = wmaShort - wmaLong;
        const middle = this.wmaSqrt(wmaDiff);
        const atr = this.props.atrMultiplier * this.atr(trueRange(d, history.prior()));
        const upper = middle + atr;
        const lower = middle - atr;
        const isUp = value >= open;
        const color = value > upper ? 
                isUp ? this.props.upColorU : this.props.upColorD : 
                value < lower ? 
                isUp ? this.props.lowColorU : this.props.lowColorD : 
                isUp ? this.props.midColorU : this.props.midColorD;
        return {
            upper,
            middle,
            lower,
            candlestick: {
                    color
                }
        };
    }

    filter(d, i) {
        return i > Math.max(this.props.period, this.props.atrPeriod);
    }
}

module.exports = {
    name: "OGCNoDid",
    description: "OGC Hull No Diddle",
    calculator: OGCHkeltnerChannelsN,
    params: {
        period: predef.paramSpecs.period(50),
        atrPeriod: predef.paramSpecs.period(50),
        atrMultiplier: predef.paramSpecs.number(4),
        upColorU: predef.paramSpecs.color('Red'),
        upColorD: predef.paramSpecs.color('DarkRed'),
        midColorU: predef.paramSpecs.color('Gray'),
        midColorD: predef.paramSpecs.color('White'),
        lowColorU: predef.paramSpecs.color('Lime'),
        lowColorD: predef.paramSpecs.color('Green')
    },
    inputType: meta.InputType.BARS,
    plots: {
        middle: { title: "Middle" },
        upper: { title: "Upper" },
        lower: { title: "Lower" }
    },
    tags: ["OneGreenCandle"],
    schemeStyles: {
        dark: {
            upper: predef.styles.plot("red"),
            middle: predef.styles.plot("#FF9966"),
            lower: predef.styles.plot("dodgerblue")
        }
    }
};
