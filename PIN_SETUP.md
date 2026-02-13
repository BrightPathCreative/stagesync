# PIN-Based Authentication Setup

The chat uses PIN numbers to identify cast members. Each cast member gets a unique PIN.

## Step 1: Assign PINs to Cast Members

1. Open `js/pin-config.js`
2. Change the PINs in `CAST_PIN_MAP` to your own unique PINs for each cast member

Example:
```javascript
var CAST_PIN_MAP = {
  '1234': 'lucas',      // Change '1234' to Lucas's PIN
  '2345': 'cc',         // Change '2345' to C.C's PIN
  '3456': 'angus',      // Change '3456' to Angus's PIN
  // ... etc
};
```

**Tips for choosing PINs:**
- Use numbers only (e.g., 4-digit, 6-digit, etc.)
- Make them easy for cast members to remember
- Don't use obvious patterns (like 1234, 0000, etc.)
- Each PIN must be unique

## Step 2: Share PINs with Cast Members

Give each cast member their PIN privately. They'll use it to access the chat.

## Step 3: Test

1. Open `chat.html` in your browser
2. Enter a PIN from `CAST_PIN_MAP`
3. You should see the chat interface with the cast member's name

## How It Works

- Cast members enter their PIN on the chat page
- The system verifies the PIN and identifies them
- Their identity persists across browser sessions (stored in localStorage)
- They can sign out to switch accounts or clear their session

## Security Notes

- PINs are stored in plain text in `pin-config.js` (visible to anyone with access to the code)
- For better security, use longer PINs (6+ digits)
- Don't share PINs publicly
- If a PIN is compromised, change it in `pin-config.js` and notify the cast member

## Changing PINs

To change a PIN:
1. Update `CAST_PIN_MAP` in `js/pin-config.js`
2. The cast member will need to sign out and sign back in with the new PIN
3. Their old session will be invalidated automatically
