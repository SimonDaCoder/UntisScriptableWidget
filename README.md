# Untis Next Lessons Widget for Scriptable

**A Scriptable widget to show the next two lessons from Untis on iOS devices.**  
Supports highlighting the current lesson and skips free periods or past lessons. Automatically rolls over to the next school day, including weekends.

## Features

- Displays **next two lessons** (current + next, or next two if no current lesson).  
- Highlights **current lesson** with filled color.  
- Skips free periods automatically.  
- Supports weekends and shows the next school day's lessons.  
- Uses the **user’s tint color** for highlights.  
- Fully compatible with **Scriptable widgets** on iOS.

## Requirements

- **iOS 14+**  
- [Scriptable](https://apps.apple.com/app/scriptable/id1405459188)  
- Untis account with API access.

## Setup

1. Open Scriptable on your iOS device.  
2. Create a new script and paste the entire `UntisNextLessons.js` content.  
3. Set your **USERNAME** and **PASSWORD** in the script:

```javascript
const USERNAME = "YourUntisUsername";
const PASSWORD = "YourUntisPassword";
```

4. Set your **SERVER** and **SCHOOL**. You can find them from your Untis web URL. For example, if your school logs in at:
```https://www.untis.com/Gym+Kronshagen```
Then:  
- **SERVER**: Take the part before the school name, replace `www.untis.com/` with the school-specific subdomain. In many cases, it will be something like `kephiso.webuntis.com`.  
- **SCHOOL**: Use the exact school name as shown in Untis, e.g., `Gym Kronshagen`. (The '+' is used as a space)


```javascript
const SERVER = "www.webuntis.com";
const SCHOOL = "Gym Kronshagen";
```
5. Save the script.  

## Adding the Widget

1. Go to your **iOS Home Screen**.  
2. Enter **Jiggle Mode** → tap **+** → search for Scriptable → **Add Widget**.  
3. Tap on the widget → select your `UntisNextLessons` script.  
4. Resize widget to your preferred size (medium (1x2) recommended).  

## Configuration

- The widget automatically adjusts the highlight based on **current time**.  
- **Tint color** is taken from the widget appearance in iOS (adjustable via Home Screen > Edit).  
- Refreshes every **5 minutes** by default (adjust `REFRESH_MINUTES` in the script).

## Notes

- Free periods are skipped.  
- If the school day is over, the widget automatically shows the **next school day's first lessons**.  
- Works with **different lesson start times**, no hardcoded times.  

## License

**MIT License (in simple words):**

- You can **use, copy, change, share** this code for free.  
- You must **keep the original copyright and license notice**.  
- **No warranty**: the author is not responsible for any problems.
