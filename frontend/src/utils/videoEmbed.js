// Turns a YouTube/Vimeo/direct video URL into an embeddable form.
// Returns: an embed iframe URL, 'direct' for mp4/webm (render a <video> tag),
// the original url as a fallback, or null if no url was given.
export function getVideoEmbed(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  if (url.endsWith('.mp4') || url.endsWith('.webm')) return 'direct';
  return url;
}
