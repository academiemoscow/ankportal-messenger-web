export function callIfDefined(functionToCall) {
	if (typeof functionToCall !== "undefined") {
		return functionToCall
	} else {
		return () => {}
	}
}