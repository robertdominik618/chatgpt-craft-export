# Contributing

Thanks for helping improve Craft Export for ChatGPT.

## Before opening a pull request

1. Keep runtime dependencies at zero unless there is a strong interoperability reason.
2. Do not add telemetry or remote code.
3. Do not copy proprietary logos or UI assets from OpenAI, ArtCraft, Microsoft, Adobe, or browser vendors.
4. Prefer semantic DOM anchors over generated CSS class names.
5. Run:

```bash
npm test
npm run build
```

## Compatibility reports

When ChatGPT changes its UI, please include:

- browser and version;
- ChatGPT language;
- whether the buttons are missing, duplicated, or attached to the wrong action row;
- a sanitized DOM snippet if possible.

Do not include private conversation text in public issues.
