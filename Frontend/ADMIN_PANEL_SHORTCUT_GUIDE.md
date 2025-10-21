# Admin Panel Access - Quick User Guide

## How to Access the Hidden Admin Panel Button

The Admin Panel button on the "Choose Your Simulation" page is hidden by default for security purposes. Follow these steps to reveal it:

### Step-by-Step Instructions

#### For Windows/Linux Users:
1. Navigate to the "Choose Your Simulation" page
2. Press and hold: **`Ctrl + Shift + A`**
3. A compact Admin Panel button will appear in the **bottom-right corner**
4. Click the button to proceed to admin login

#### For Mac Users:
1. Navigate to the "Choose Your Simulation" page
2. Press and hold: **`Cmd + Shift + A`** (⌘ + Shift + A)
3. A compact Admin Panel button will appear in the **bottom-right corner**
4. Click the button to proceed to admin login

### Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│          Choose Your Simulation Page                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   [Simulation 1]  [Simulation 2]  [Simulation 3]       │
│                                                          │
│   [Simulation 4]  [Simulation 5]  [Simulation 6]       │
│                                                          │
│                                  [👆 Press Ctrl+Shift+A]│
└─────────────────────────────────────────────────────────┘

                        ↓ ↓ ↓
              After pressing Ctrl+Shift+A
                        ↓ ↓ ↓

┌─────────────────────────────────────────────────────────┐
│          Choose Your Simulation Page                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   [Simulation 1]  [Simulation 2]  [Simulation 3]       │
│                                                          │
│   [Simulation 4]  [Simulation 5]  [Simulation 6]       │
│                                                          │
│                              ┌──────────────┐           │
│                              │ 🛡️ Admin     │ ← Corner! │
│                              │   Panel      │           │
│                              └──────────────┘           │
└─────────────────────────────────────────────────────────┘
```

### Features

✅ **Hidden by Default** - Admin access is not visible to regular users  
✅ **Corner Placement** - Appears in bottom-right corner, doesn't interfere with simulations  
✅ **Compact Size** - Small, unobtrusive button (256px width)  
✅ **Toggle On/Off** - Press the shortcut again to hide the button  
✅ **Smooth Animation** - Button fades in/out smoothly with scale effect  
✅ **Hover Tooltip** - Hover over the shield icon to see "Admin Panel" tooltip  
✅ **Cross-Platform** - Works on Windows, Mac, and Linux  
✅ **Fixed Position** - Stays in corner even when scrolling  

### Keyboard Shortcuts Summary

| Platform        | Shortcut           | Action                  |
|-----------------|-------------------|-------------------------|
| Windows/Linux   | `Ctrl + Shift + A` | Toggle Admin Button     |
| Mac             | `Cmd + Shift + A`  | Toggle Admin Button     |

### Troubleshooting

**Q: The button doesn't appear when I press the shortcut**
- A: Make sure you're pressing all three keys simultaneously (Ctrl/Cmd + Shift + A)
- A: Ensure the page is focused (click on the page first)
- A: Try pressing the shortcut again (it toggles on/off)

**Q: The button disappeared**
- A: Press the shortcut again to make it reappear (it's a toggle)

**Q: I can't remember the shortcut**
- A: Remember "**A**" for "**A**dmin" - Ctrl/Cmd + Shift + A

**Q: Does this work on mobile/tablet?**
- A: This feature is designed for desktop browsers with keyboard access

### Security Note

🔒 **Important**: The hidden button is a UI convenience feature only. Full authentication is still required to access the admin panel. This provides an additional layer of obscurity but does not replace proper authentication and authorization.

### For Developers

If you need to modify the keyboard shortcut or behavior, see:
- File: `Frontend/src/pages/Simulation.jsx`
- Documentation: `Frontend/ADMIN_PANEL_SHORTCUT_IMPLEMENTATION.md`

---

**Last Updated**: October 2025  
**Version**: 1.0.0

