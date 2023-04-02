// To properly export SVGs as data URLs, see https://github.com/orgs/marp-team/discussions/425
const marpEngineJs = `
module.exports = ({ marp }) => marp.use((md) => {
  // https://github.com/markdown-it/markdown-it/issues/447#issuecomment-373408654
  const defaultValidateLink = md.validateLink;
  md.validateLink = url => /^data:image\\/.*?;/.test(url) || defaultValidateLink(url);
})`;

export function getEngine(): string {
	return marpEngineJs;
}
