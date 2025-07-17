# Codera Setup Guide - Teacher Role, Contests & AI Features

## New Features Added

### 1. Teacher Role System
- Teachers can register with institutional information
- Teachers can create and manage live contests
- Role-based permissions and access control

### 2. Live Contest System
- Real-time contests with time limits
- Automatic leaderboard updates
- Contest announcements and participant management
- Multiple problem support with custom scoring

### 3. AI Assistant Integration
- Code review and analysis using OpenAI GPT
- Personalized learning roadmaps
- Smart hints and debugging help
- Interaction history and feedback system

## Additional Environment Variables

Add these to your `server/.env` file:

```env
# OpenAI API Configuration (required for AI features)
OPENAI_API_KEY=your-openai-api-key-here
```

## Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

**Note**: OpenAI API has usage-based pricing. Monitor your usage in the OpenAI dashboard.

## New Database Collections

The application now includes additional MongoDB collections:

### Contests Collection
- Stores contest information, participants, and leaderboards
- Manages contest timing and status updates
- Tracks submissions and scoring

### AI Interactions Collection
- Logs all AI assistant interactions
- Stores user queries and AI responses
- Tracks usage and feedback for improvement

## Updated User Registration

Users can now register as either:
- **Student**: Standard user with problem-solving access
- **Teacher**: Can create contests and manage competitions

Teachers provide additional information:
- Institution name
- Department
- Years of experience
- Areas of specialization

## New API Endpoints

### Contest Management
- `POST /api/contests/create` - Create new contest (teachers only)
- `GET /api/contests` - List all contests
- `GET /api/contests/:id` - Get contest details
- `POST /api/contests/:id/join` - Join contest
- `POST /api/contests/:id/submit` - Submit solution in contest

### AI Assistant
- `POST /api/ai/code-review` - Get code analysis and feedback
- `POST /api/ai/roadmap` - Generate learning roadmap
- `POST /api/ai/hint` - Get problem-solving hints
- `POST /api/ai/debug` - Get debugging help
- `GET /api/ai/history` - View interaction history

## New Frontend Pages

### Contests Page (`/contests`)
- Browse active, upcoming, and finished contests
- Join contests and view leaderboards
- Teachers can create new contests

### AI Assistant Page (`/ai-assistant`)
- Code review and analysis tools
- Personalized learning roadmap generation
- Smart hints and debugging assistance
- Interaction history and feedback

## Contest Features

### For Teachers:
- Create contests with custom problems
- Set time limits and participant restrictions
- Make announcements during contests
- View real-time leaderboards and statistics

### For Students:
- Browse and join public contests
- Compete in real-time with other participants
- View live leaderboards and rankings
- Submit solutions with instant feedback

## AI Assistant Features

### Code Review
- Analyzes code quality and structure
- Provides complexity analysis (time/space)
- Suggests improvements and best practices
- Identifies potential bugs and edge cases

### Learning Roadmap
- Personalized based on skill level and goals
- Considers time commitment and preferences
- Provides structured learning phases
- Includes recommended resources and practice problems

### Smart Hints
- Context-aware problem-solving guidance
- Doesn't spoil the solution
- Provides conceptual insights and approaches
- Helps overcome common obstacles

### Debug Help
- Analyzes error messages and code issues
- Provides step-by-step debugging guidance
- Explains root causes of problems
- Offers prevention tips for similar issues

## Usage Examples

### Creating a Contest (Teacher)
1. Navigate to `/contests`
2. Click "Create Contest"
3. Fill in contest details and select problems
4. Set start time and duration
5. Configure participant settings
6. Publish the contest

### Using AI Assistant
1. Go to `/ai-assistant`
2. Choose the type of help needed:
   - Code Review: Paste code for analysis
   - Roadmap: Set goals and preferences
   - Hint: Select a problem for guidance
   - Debug: Provide code and error details
3. Get AI-powered assistance
4. Provide feedback to improve responses

## Performance Considerations

### AI API Usage
- Monitor OpenAI API usage and costs
- Implement rate limiting for AI endpoints
- Cache common responses when appropriate
- Set reasonable token limits for responses

### Contest Scalability
- Real-time leaderboard updates use WebSocket
- Consider database indexing for large contests
- Implement pagination for contest listings
- Monitor server resources during active contests

## Security Notes

### API Key Management
- Keep OpenAI API key secure and private
- Use environment variables, never commit keys
- Rotate keys regularly for security
- Monitor API usage for unusual activity

### Contest Security
- Validate teacher permissions for contest creation
- Prevent cheating through code similarity detection
- Implement proper contest timing validation
- Secure contest data and participant information

## Testing the New Features

### Teacher Registration
1. Register with role "teacher"
2. Fill in institutional information
3. Verify teacher-specific UI elements appear

### Contest Creation
1. Log in as teacher
2. Create a test contest
3. Join as student from different account
4. Test submission and leaderboard updates

### AI Assistant
1. Try code review with sample code
2. Generate a learning roadmap
3. Request hints for existing problems
4. Test debug help with error scenarios

## Troubleshooting

### OpenAI API Issues
- Verify API key is correct and active
- Check OpenAI service status
- Monitor rate limits and quotas
- Review error logs for specific issues

### Contest Problems
- Ensure proper time zone handling
- Verify WebSocket connections for real-time updates
- Check database permissions for contest operations
- Monitor server performance during contests

### Database Issues
- Run database migrations if needed
- Verify new collections are created
- Check indexes for performance
- Monitor storage usage growth

Your Codera application now includes comprehensive teacher tools, live contest management, and AI-powered learning assistance!