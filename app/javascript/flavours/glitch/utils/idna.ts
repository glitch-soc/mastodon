import punycode from 'punycode/';

const IDNA_PREFIX = 'xn--';

export const decode = (domain: string) => {
  return domain
    .split('.')
    .map((part) =>
      part.startsWith(IDNA_PREFIX)
        ? punycode.decode(part.slice(IDNA_PREFIX.length))
        : part,
    )
    .join('.');
};
