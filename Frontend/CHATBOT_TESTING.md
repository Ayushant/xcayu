# Chatbot Testing Guide 🧪

## Quick Test Instructions

### Step 1: Start the Development Server

```bash
cd Frontend
npm run dev
```

The server should start at `http://localhost:5173`

### Step 2: Test on Each Page

#### ✅ Test 1: Home Page
1. Navigate to: `http://localhost:5173/`
2. Look for the **blue pulsing button** in the bottom-right corner
3. **Expected**: Button is visible and pulsing

#### ✅ Test 2: About Page
1. Navigate to: `http://localhost:5173/about`
2. Look for the **blue pulsing button** in the bottom-right corner
3. **Expected**: Button is visible and pulsing

#### ✅ Test 3: Contact Page
1. Navigate to: `http://localhost:5173/contact`
2. Look for the **blue pulsing button** in the bottom-right corner
3. **Expected**: Button is visible and pulsing

#### ❌ Test 4: Simulation Page (Should NOT have chatbot)
1. Navigate to: `http://localhost:5173/simulation`
2. Look for the chat button
3. **Expected**: NO chat button visible ✅

### Step 3: Test Chat Functionality

#### Open Chat
1. Click the blue pulsing button
2. **Expected**: 
   - Chat window slides up and scales in (300ms animation)
   - Header shows "Xaction Assistant"
   - Messages area is empty initially

#### Greeting Message
1. Wait 800ms after opening
2. **Expected**:
   - Three bouncing dots appear (typing indicator)
   - Greeting message appears on the left
   - 4 quick reply buttons appear below:
     - "What is Xaction?"
     - "Tell me about simulations"
     - "Who are the founders?"
     - "How to get started?"

#### Question 1: "What is Xaction?"
1. Click "What is Xaction?" button
2. **Expected**:
   - User message appears on right (blue background)
   - Quick replies disappear
   - Typing indicator shows (3 bouncing dots)
   - After 1200ms: Bot response appears on left
   - New quick replies appear:
     - "What makes Xaction different?"
     - "Tell me about the mission"
     - "How to get started?"
     - "Start over"

#### Question 2: "Tell me about simulations"
1. Click back to Home, open chat again
2. Click "Tell me about simulations"
3. **Expected**:
   - User message appears on right
   - Bot response about simulations after delay
   - New quick replies appear

#### Question 3: "Who are the founders?"
1. Click "Who are the founders?" (from initial quick replies)
2. **Expected**:
   - Response lists all 3 founders:
     - Priyaranjan Kumar
     - Akshansh Vidyarthy
     - Ayushant Khandekar

#### Test "Start over"
1. After a few exchanges, click "Start over"
2. **Expected**:
   - New bot message: "Sure! Let's start fresh..."
   - Original 4 quick replies return
   - Conversation effectively resets

### Step 4: Test Chat Window Features

#### Auto-scroll
1. Click through 5-6 questions
2. **Expected**: 
   - Messages area automatically scrolls to bottom
   - Latest message always visible

#### Close Chat
1. Click the **X button** in header
2. **Expected**:
   - Chat window scales down and fades out (300ms)
   - Button remains visible
   - Chat can be reopened

### Step 5: Mobile Testing

#### Desktop View (≥768px)
1. Open browser DevTools (F12)
2. Resize to desktop width (e.g., 1024px)
3. **Expected**:
   - Chat window: 380px × 600px
   - Position: Fixed bottom-right (24px from edges)
   - No overlay background
   - Body scroll works normally

#### Mobile View (<768px)
1. Resize browser to mobile width (e.g., 375px)
2. Open chat
3. **Expected**:
   - Chat window: 95vw × 85vh
   - Position: Centered on screen
   - Semi-transparent overlay behind chat
   - **Body scroll STILL WORKS** (scroll page behind chat)
   - Touch targets are larger

#### Test Mobile Overlay
1. In mobile view, open chat
2. Click on the dark overlay (outside chat window)
3. **Expected**: Chat closes

### Step 6: Animation Testing

#### Button Pulse
1. Look at the closed chat button
2. **Expected**: Continuous subtle pulse animation

#### Open Animation
1. Click button
2. **Expected**: 
   - Window scales from 0.9 to 1.0
   - Opacity fades from 0 to 1
   - Duration: 300ms

#### Message Slide
1. Watch new messages appear
2. **Expected**:
   - Slide up from 10px below
   - Fade in from opacity 0 to 1
   - Duration: 200ms

#### Typing Indicator
1. Watch the three dots while waiting
2. **Expected**:
   - Three dots bounce sequentially
   - Delay: 0ms, 150ms, 300ms

#### Quick Reply Stagger
1. Watch quick reply buttons appear
2. **Expected**:
   - Each button has 50ms delay
   - Stagger animation creates wave effect

### Step 7: Edge Cases

#### Rapid Clicking
1. Click the same quick reply button rapidly
2. **Expected**: 
   - Should handle gracefully
   - No duplicate messages
   - Typing indicator prevents multiple triggers

#### Long Messages
1. Ask questions with long answers (e.g., "Who are the founders?")
2. **Expected**:
   - Text wraps properly
   - Messages area scrolls
   - No overflow issues

#### Multiple Opens/Closes
1. Open and close chat 5-10 times rapidly
2. **Expected**:
   - Animations smooth every time
   - No memory leaks
   - No console errors

## Testing Checklist

### Functional Tests
- [ ] Chat button visible on Home page
- [ ] Chat button visible on About page
- [ ] Chat button visible on Contact page
- [ ] Chat button NOT visible on Simulation page
- [ ] Button pulse animation works
- [ ] Chat window opens with animation
- [ ] Greeting appears after 800ms delay
- [ ] Typing indicator shows 3 bouncing dots
- [ ] All 10 questions work correctly
- [ ] Quick replies are clickable
- [ ] User messages appear on right (blue)
- [ ] Bot messages appear on left (white)
- [ ] Auto-scroll to latest message
- [ ] "Start over" resets conversation
- [ ] Close button (X) works
- [ ] Conversation history preserved until close

### Design Tests
- [ ] Glassmorphism effect (blur) visible
- [ ] Gradient colors correct (blue → indigo)
- [ ] All animations smooth (no jank)
- [ ] Button size: 60px diameter
- [ ] Desktop window: 380px × 600px
- [ ] Mobile window: 95vw × 85vh
- [ ] Proper spacing and padding
- [ ] Text readable and well-formatted

### Responsive Tests
- [ ] Desktop (≥768px): Chat in bottom-right
- [ ] Mobile (<768px): Chat centered with overlay
- [ ] Touch targets adequate (min 44px)
- [ ] Body scroll works on desktop
- [ ] Body scroll works on mobile (CRITICAL)
- [ ] Overlay closes chat on mobile
- [ ] Z-index layering correct

### Browser Tests
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on mobile Safari (iOS)
- [ ] Works on Chrome Mobile (Android)

### Performance Tests
- [ ] No lag when opening/closing
- [ ] Smooth animations (60fps)
- [ ] No memory leaks
- [ ] No console errors
- [ ] Quick response times
- [ ] Page load not affected

## Common Issues & Solutions

### Issue: Chat button not visible
**Check**:
- Are you on Home, About, or Contact page?
- Check browser DevTools console for errors
- Verify chatbot component is imported in page

### Issue: Animations stuttering
**Check**:
- Browser hardware acceleration enabled
- No other heavy processes running
- Try in incognito mode

### Issue: Chat window not opening
**Check**:
- Click is registered (check DevTools)
- No JavaScript errors in console
- State management working (React DevTools)

### Issue: Body scroll locked on mobile
**Check**:
- This SHOULD NOT happen!
- Verify ChatbotWindow.jsx has proper scroll container
- Check for `overflow: hidden` on body (should not be there)

### Issue: Quick replies not working
**Check**:
- Button onClick handler is wired correctly
- chatbotData.js has the question defined
- Question text matches exactly (case-sensitive)

### Issue: Styling broken
**Check**:
- Tailwind CSS is properly installed
- Run `npm run dev` to rebuild styles
- Clear browser cache

## Visual Test Checklist

### Chat Button
- [ ] Visible in bottom-right corner
- [ ] 60px × 60px circle
- [ ] Blue gradient background
- [ ] White chat icon
- [ ] Pulse animation active
- [ ] Hover: scales to 1.1x
- [ ] Shadow: 2xl

### Chat Window (Open)
- [ ] Glassmorphism effect (blurred background)
- [ ] White/95 background
- [ ] Rounded corners (16px)
- [ ] Shadow: 2xl
- [ ] Header: Blue gradient
- [ ] Header text: "Xaction Assistant"
- [ ] Close button (X) visible
- [ ] Scrollable messages area
- [ ] Quick replies at bottom
- [ ] Disabled text input

### Messages
- [ ] Bot: Left-aligned, white/90 background
- [ ] User: Right-aligned, blue gradient
- [ ] Proper spacing (mb-4)
- [ ] Text wraps correctly
- [ ] Slide-up animation
- [ ] Readable font size

### Quick Replies
- [ ] Pill-shaped (rounded-full)
- [ ] Blue gradient background
- [ ] White text
- [ ] Hover: darker gradient + scale
- [ ] Wrap on multiple lines
- [ ] Stagger animation

## Performance Benchmarks

### Expected Metrics
- **Initial load**: < 50ms (no external calls)
- **Button click to open**: 300ms (animation)
- **Greeting delay**: 800ms (intentional)
- **Response delay**: 1200ms (intentional)
- **Close animation**: 300ms
- **Memory usage**: < 5MB
- **Bundle size**: ~10KB uncompressed

## Final Verification

Before marking as complete, verify:

1. ✅ **All pages tested**: Home, About, Contact (has chatbot), Simulation (no chatbot)
2. ✅ **All 10 questions work**: Each Q&A pair responds correctly
3. ✅ **Animations smooth**: Open, close, messages, typing, quick replies
4. ✅ **Responsive**: Desktop and mobile layouts correct
5. ✅ **Body scroll preserved**: Can scroll page on mobile with chat open
6. ✅ **No errors**: Console is clean, no linter errors
7. ✅ **Cross-browser**: Works in Chrome, Firefox, Safari, Edge

## Success Criteria

✅ **Functionality**: All features work as expected  
✅ **Design**: Matches specifications and brand  
✅ **Performance**: Smooth, fast, no lag  
✅ **Responsive**: Perfect on all screen sizes  
✅ **Accessibility**: ARIA labels, keyboard support  
✅ **Code Quality**: No errors, clean code  
✅ **Documentation**: Complete and clear  

## Next Steps After Testing

1. ✅ Fix any issues found
2. ✅ Deploy to staging environment
3. ✅ User acceptance testing
4. ✅ Deploy to production
5. ✅ Monitor for issues

---

**Happy Testing! 🎉**

If all tests pass, your chatbot is ready for production deployment!

**Testing Time**: ~15-20 minutes  
**Expected Result**: All tests pass ✅

