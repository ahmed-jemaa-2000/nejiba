# Environment Variables for Nejiba Studio

Create a `.env.local` file in the root of the project with these values:

```env
# OpenAI API Key (for workshop plan generation)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# GeminiGen API Key (for poster image generation)
# Get from: https://geminigen.ai
GEMINIGEN_API_KEY=your-geminigen-api-key-here
```

## API Usage

| Feature | API | Model |
|---------|-----|-------|
| Workshop Plans | OpenAI | gpt-4o-mini |
| Poster Images | GeminiGen | imagen-pro |
| Ideas Generator | OpenAI | gpt-4o-mini |

## Notes

- Both APIs have free tiers available
- App works without API keys (uses sample/placeholder data)
- `imagen-pro` is rate limited: 5 req/min, 100 req/hour, 1000 req/day
