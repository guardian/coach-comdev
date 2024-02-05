// place files you want to import through the `$lib` alias in this folder.

export const slotNameFromURL = (url: string) => {
	const adRequest = new URL(url);
	const adRequestParams = adRequest.searchParams;

	const prevScp = new URLSearchParams(adRequestParams.get('prev_scp') || '');

	return prevScp.get('slot');
};

export const isGuardianUrl = (url: string) =>
	url.match(/https?:\/\/(www\.)?theguardian\.com/) ||
	url.match(/https?:\/\/m\.code\.dev-theguardian\.com/) ||
	url.match(/http:\/\/localhost:3030/) ||
	url.match(/http:\/\/localhost:9000/) ||
	url.match(/https:\/\/m\.thegulocal\.com/);
