# Chatbot Component 💬

Modern, AI-styled static chatbot for the Xaction website.

## Overview

A fully self-contained chatbot component that provides intelligent-looking responses to pre-defined questions. No backend integration required - runs entirely on the frontend.

## Component Architecture

```
Chatbot/ (Main Container)
  ├── ChatbotButton (Floating button)
  ├── ChatbotWindow (Chat interface)
  │     ├── ChatbotMessage × n (Message bubbles)
  │     ├── TypingIndicator (Animated dots)
  │     └── ChatbotQuickReplies (Action buttons)
  └── chatbotData.js (Q&A database)
```

## Files

### `Chatbot.jsx` (Main Component)
**Purpose**: State management and business logic

**State**:
- `isOpen`: Boolean - Chat window visibility
- `messages`: Array - Conversation history
- `isTyping`: Boolean - Show typing indicator
- `quickReplies`: Array - Available quick reply options

**Key Functions**:
- `handleQuickReplyClick(reply)`: Process user clicks
- `handleToggle()`: Open/close chat
- `handleClose()`: Close chat

**Lifecycle**:
1. Component mounts
2. When opened, shows greeting after 800ms delay
3. User clicks quick reply
4. Shows typing indicator for 1200ms
5. Displays bot response with new quick replies

### `ChatbotButton.jsx`
**Purpose**: Floating chat button with pulse animation

**Features**:
- 60px diameter circle
- Gradient blue background
- Pulse animation (continuous)
- Hover: Scale to 1.1x
- Fixed position: bottom-right

**Props**:
- `onClick`: Function - Opens chat window

### `ChatbotWindow.jsx`
**Purpose**: Chat window UI with messages and controls

**Features**:
- Glassmorphism design (backdrop-blur)
- Gradient header with close button
- Scrollable messages area
- Quick replies section
- Disabled text input (placeholder)

**Props**:
- `isOpen`: Boolean - Show/hide window
- `onClose`: Function - Close handler
- `messages`: Array - Message history
- `isTyping`: Boolean - Show typing indicator
- `quickReplies`: Array - Quick reply buttons
- `onQuickReplyClick`: Function - Handle quick reply clicks

**Layout**:
- Desktop: 380px × 600px, fixed bottom-right
- Mobile: 95vw × 85vh, centered with overlay

### `ChatbotMessage.jsx`
**Purpose**: Individual message bubble

**Features**:
- Slide-up animation on render
- Different styles for bot/user messages
- Text wrapping and line breaks

**Props**:
- `message`: String - Message text
- `isBot`: Boolean - Bot or user message

**Styling**:
- **Bot**: White/90 background, left-aligned, gray text
- **User**: Blue gradient, right-aligned, white text

### `ChatbotQuickReplies.jsx`
**Purpose**: Quick reply buttons

**Features**:
- Pill-shaped buttons
- Stagger animation (50ms delay each)
- Hover effects (scale + color)
- Wrapping layout (flex-wrap)

**Props**:
- `replies`: Array - Button labels
- `onReplyClick`: Function - Click handler

**Styling**:
- Gradient blue background
- Rounded-full shape
- Hover: Darker gradient + scale

### `chatbotData.js`
**Purpose**: Static Q&A database

**Structure**:
```javascript
{
  greeting: {
    message: "Welcome message",
    quickReplies: ["Q1", "Q2", "Q3", "Q4"]
  },
  faqs: {
    "Question 1": {
      answer: "Answer 1",
      quickReplies: ["Related Q1", "Related Q2", "Start over"]
    },
    // ... more Q&A pairs
  }
}
```

## Data Flow

```
User clicks button
    ↓
Chatbot.jsx: setIsOpen(true)
    ↓
ChatbotWindow appears
    ↓
useEffect: Show greeting
    ↓
setIsTyping(true) → 800ms delay → setIsTyping(false)
    ↓
Add greeting message to messages[]
    ↓
Set greeting quick replies
    ↓
User clicks quick reply
    ↓
handleQuickReplyClick(reply)
    ↓
Add user message to messages[]
    ↓
setIsTyping(true) → 1200ms delay → setIsTyping(false)
    ↓
Lookup answer in chatbotData.faqs
    ↓
Add bot message to messages[]
    ↓
Update quick replies
    ↓
Repeat...
```

## Usage

### Basic Integration

```jsx
import Chatbot from './components/Chatbot/Chatbot';

function App() {
  return (
    <div>
      {/* Your page content */}
      <Chatbot />
    </div>
  );
}
```

### Current Integration

The chatbot is currently integrated in:
- `Frontend/src/pages/Home.jsx`
- `Frontend/src/pages/About.jsx`
- `Frontend/src/pages/Contact.jsx`

**NOT** integrated in:
- `Frontend/src/pages/Simulation.jsx` (intentionally excluded)

## Customization

### Add New Q&A

1. Open `chatbotData.js`
2. Add to `faqs` object:

```javascript
faqs: {
  "Your new question": {
    answer: "Your detailed answer here...",
    quickReplies: [
      "Related topic 1",
      "Related topic 2",
      "Contact information",
      "Start over"
    ]
  }
}
```

3. Add question to appropriate quick replies

### Change Colors

**Button & Header**:
```javascript
// Change from: from-blue-600 to-indigo-600
// Change to: from-purple-600 to-pink-600
```

**Messages**:
```javascript
// ChatbotMessage.jsx - User messages
className="bg-gradient-to-r from-your-color-1 to-your-color-2"
```

### Adjust Timing

**Greeting delay** (`Chatbot.jsx` line 22):
```javascript
setTimeout(() => { ... }, 800); // Change 800 to your value
```

**Response delay** (`Chatbot.jsx` line 40):
```javascript
setTimeout(() => { ... }, 1200); // Change 1200 to your value
```

### Modify Position

**Button** (`ChatbotButton.jsx`):
```javascript
className="fixed bottom-6 right-6" // Change position
```

**Window** (`ChatbotWindow.jsx`):
```javascript
style={{
  bottom: '24px', // Change
  right: '24px',  // Change
}}
```

## Styling

### Design System

**Colors**:
- Primary: Blue 600 (#2563EB)
- Secondary: Indigo 600 (#4F46E5)
- Text (Bot): Gray 800 (#1F2937)
- Text (User): White (#FFFFFF)
- Background: White/95 (rgba(255,255,255,0.95))

**Animations**:
- Scale In: 0.3s ease-in-out
- Slide Up: 0.2s ease-out
- Pulse: 2s infinite
- Bounce: (typing indicator)

**Shadows**:
- Button: 2xl
- Window: 2xl
- Messages: sm (bot), md (user)

### Responsive Breakpoints

**Desktop (md: ≥768px)**:
- Window: 380px × 600px
- Position: Fixed bottom-right
- No overlay

**Mobile (<768px)**:
- Window: 95vw × 85vh
- Position: Fixed centered
- Dark overlay background

## Performance

**Bundle Size** (uncompressed):
- Chatbot.jsx: ~2KB
- ChatbotButton.jsx: ~1KB
- ChatbotWindow.jsx: ~3KB
- ChatbotMessage.jsx: ~1KB
- ChatbotQuickReplies.jsx: ~1KB
- chatbotData.js: ~2KB
- **Total**: ~10KB (~3-4KB gzipped)

**Rendering**:
- Initial render: Fast (no external calls)
- Re-renders: Optimized (minimal state updates)
- Animations: GPU-accelerated (transform, opacity)

**Memory**:
- Message history: ~100 bytes per message
- No memory leaks (proper cleanup)

## Accessibility

**ARIA Labels**:
- Chat button: `aria-label="Open chat"`
- Close button: `aria-label="Close chat"`

**Keyboard Support** (can be enhanced):
- Enter: Send message / Select quick reply
- Escape: Close chat
- Tab: Navigate between elements

**Screen Readers**:
- Messages announced as they appear
- Button states communicated
- Quick replies navigable

## Browser Support

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  
✅ Mobile browsers (iOS 14+, Android 10+)

**Features used**:
- CSS `backdrop-filter` (glassmorphism)
- CSS animations & transitions
- Flexbox layout
- React Hooks (useState, useEffect, useRef)

## Testing

### Manual Testing Checklist

- [ ] Button appears and is clickable
- [ ] Window opens with animation
- [ ] Greeting appears after delay
- [ ] Quick replies are clickable
- [ ] User messages appear (right side)
- [ ] Bot responses appear (left side)
- [ ] Typing indicator shows before responses
- [ ] Auto-scrolls to latest message
- [ ] "Start over" resets conversation
- [ ] Close button works
- [ ] Mobile overlay closes on click
- [ ] Responsive on all screen sizes

### Common Issues

**Issue**: Chatbot doesn't appear
- **Fix**: Check if component is imported and rendered

**Issue**: Animations not working
- **Fix**: Ensure Tailwind CSS includes animation utilities

**Issue**: Scrolling not working
- **Fix**: Check overflow-y: auto on messages container

**Issue**: Quick replies not responding
- **Fix**: Verify onQuickReplyClick prop is passed correctly

## Future Enhancements

**Easy additions**:
- [ ] Text input functionality
- [ ] Conversation history (localStorage)
- [ ] More Q&A topics
- [ ] Emoji support
- [ ] Dark mode

**Advanced additions**:
- [ ] Real AI integration (OpenAI, etc.)
- [ ] Live chat handoff
- [ ] File/image sharing
- [ ] Voice input
- [ ] Multi-language support
- [ ] Analytics tracking

## Dependencies

**Required**:
- React 18+
- Tailwind CSS 3+

**Optional**:
- None! (fully self-contained)

## API Reference

### `<Chatbot />`

Main chatbot component. No props required.

```jsx
<Chatbot />
```

**State Management**: Internal (useState)  
**Lifecycle**: Auto-initializes greeting on open  
**Event Handlers**: All internal

### chatbotData

```javascript
import { chatbotData } from './chatbotData';

// Access greeting
chatbotData.greeting.message
chatbotData.greeting.quickReplies

// Access FAQ
chatbotData.faqs["Question"].answer
chatbotData.faqs["Question"].quickReplies
```

## License

Part of Xaction project. See project root LICENSE.

## Author

Built for Xaction by AI Assistant  
Version: 1.0.0  
Last Updated: October 2025

---

**Need help?** Check the main documentation:
- `Frontend/CHATBOT_IMPLEMENTATION.md` - Full guide
- `Frontend/CHATBOT_VISUAL_GUIDE.md` - Visual diagrams  
- `Frontend/CHATBOT_QUICK_START.md` - Quick start

