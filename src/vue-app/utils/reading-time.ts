const WORDS_PER_MINUTE = 280;
const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;

export function calculateReadingTime(content: string): number {
	const cleaned = content
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`[^`]+`/g, "")
		.replace(/<[^>]+>/g, "");

	const cjkChars = (cleaned.match(CJK_REGEX) || []).length;
	const otherText = cleaned.replace(CJK_REGEX, " ").trim();
	const words = otherText ? otherText.split(/\s+/).filter(Boolean).length : 0;

	const totalUnits = cjkChars + words;
	return Math.max(1, Math.ceil(totalUnits / WORDS_PER_MINUTE));
}