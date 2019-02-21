export function callIfDefined(functionToCall) {
	if (typeof functionToCall !== "undefined") {
		return functionToCall
	} else {
		return () => {}
	}
}


export class DateNumber extends Date {

	static since1970(epochValue) {
		var dateEpoch1970 = new DateNumber(0);
		dateEpoch1970.setUTCSeconds(epochValue);
		return dateEpoch1970;	
	}

}
