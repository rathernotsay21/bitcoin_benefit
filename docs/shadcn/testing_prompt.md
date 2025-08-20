# Prompt for Frontend Developer Agent (Claude Opus 4.1)

## **Objective:** Comprehensive UI/UX Quality Assurance Testing

**Agent:** `frontend-developer`

**Task:** You are tasked with conducting a thorough quality assurance (QA) test of the recent `shadcn/ui` implementation for the Bitcoin Benefit application. The primary goal is to ensure all new components are fully functional, visually polished, responsive, and free of any regressions. The implementation details are documented in `/docs/shadcn/`.

Use your available tools, including MCP Server for navigating the application, to meticulously test every aspect of the plan.

---

### **General Testing Protocol**

For every feature listed below, you must perform the following checks:

1.  **Responsiveness:** Test on a wide range of screen sizes:
    *   **Mobile:** 320px, 375px
    *   **Tablet:** 768px
    *   **Desktop:** 1920px
2.  **Theming:** Verify every component works flawlessly in both **Light Mode** and **Dark Mode**.
3.  **Interactivity:** Ensure all buttons, links, tabs, and form inputs are interactive and provide clear visual feedback (hover, focus, active states).
4.  **Accessibility (A11y):** Confirm keyboard navigability for all interactive elements. Check for a logical focus order and proper ARIA attributes.

---

### **Feature-by-Feature Testing Checklist**

#### **1. Mobile Navigation (`Sheet` component)**

*   **Trigger:** On a mobile viewport, confirm the presence of a hamburger menu icon.
*   **Functionality:**
    *   Click the icon to open the navigation `Sheet`. Verify the slide-in animation is smooth.
    *   Confirm all navigation links are present, including the new **"Tools"** link.
    *   The active navigation link must be correctly highlighted.
    *   Click a navigation link and verify the `Sheet` closes automatically.
*   **Theme Toggle:** Test the Light/Dark mode toggle located inside the `Sheet`.
*   **Closing:** Ensure the `Sheet` can be closed by swiping, clicking the overlay backdrop, or pressing the Escape key.

#### **2. Scheme Selection (`Tabs` component)**

*   **Location:** Navigate to the Calculator (`/calculator`) and Historical (`/historical`) pages.
*   **Replacement:** Verify the old radio button cards have been replaced with a three-tab selector ("Pioneer", "Stacker", "Builder").
*   **Interactivity:**
    *   Click each tab and confirm the page content below updates instantly and correctly.
    *   The active tab must be styled with the Bitcoin orange theme.
*   **URL Sync:**
    *   Check that the URL is updated with the correct `?scheme=` query parameter when a tab is changed.
    *   Test the browser's back and forward buttons to ensure they correctly switch the active tab.
*   **Responsiveness:** On narrow screens, confirm the tabs are horizontally scrollable if they overflow.

#### **3. Enhanced Data Table (Historical Page)**

*   **Location:** Navigate to the Historical page (`/historical`).
*   **Component:** Confirm the old HTML table is replaced by the new `tanstack/react-table` component.
*   **Functionality:**
    *   **Sorting:** Test column sorting for "Year", "BTC", and "Current Value". The sort direction icons (arrows) must appear and function correctly.
    *   **Export:** Click the "Export CSV" button and verify a CSV file is downloaded.
    *   **Highlighting:** Check for special row highlighting for 5-year and 10-year milestones.
*   **Responsiveness:**
    *   **Mobile:** Confirm the view is condensed to show only essential columns (e.g., "Year", "BTC", "Current Value").
    *   **Desktop:** Confirm all columns are visible.
*   **Summary Stats:** Verify the summary statistic cards above the table are present and display accurate data.

#### **4. Bitcoin Tools Page (Tabs, Cards, Command Palette)**

*   **Location:** Navigate to the "Tools" page (`/bitcoin-tools`).
*   **Layout:**
    *   Verify the page uses a tabbed interface to switch between the 5 tools (Transaction, Fees, Network, Address, Timestamp).
    *   Check for descriptive badges ('Live', 'New', 'Popular') on the tabs.
*   **Functionality:**
    *   Test switching between all tool tabs. The correct tool must load without a full page refresh.
    *   Test the core functionality of at least two tools (e.g., enter a testnet transaction ID in the lookup tool) to ensure the underlying logic is still connected.
*   **Command Palette:**
    *   Use the keyboard shortcut **Cmd+K** (or Ctrl+K) to open the command palette.
    *   Search for a tool by typing its name (e.g., "fee").
    *   Select a tool from the palette and confirm it navigates to the correct tab.

#### **5. Help Tooltips**

*   **Location:** Navigate to the Calculator page.
*   **Trigger:** Find terms with a question mark icon (e.g., "Initial Grant," "CAGR," "ROI").
*   **Functionality:** Hover over the icon and verify a `Tooltip` appears with a clear, concise explanation.
*   **Theming:** Check that tooltips are styled correctly for both light and dark modes.

#### **6. Loading & Error States (`Skeleton` & `Alert`)**

*   **Loading States:** As you navigate, pay close attention to loading transitions. Look for `Skeleton` loaders (grey, pulsing shapes) that mimic the page layout while data is being fetched (especially on the historical page).
*   **Error States:** Attempt to trigger an error (e.g., enter an invalid ID in a lookup tool). Verify that a styled `Alert` component appears with a clear, user-friendly error message and retry/dismiss options, replacing any generic browser errors.

---

### **Final Report**

Document any bugs, visual glitches, or deviations from the expected behavior described in the implementation plans. Your final assessment should confirm that the new UI is robust, intuitive, and ready for production.