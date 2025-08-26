Carousel Metric Card Review (Middle of Calculator Page):

BUG FOUND: Changing the "Bitcoin Bonus Amount" does not immediately update the metric cards in the carousel. The cards (like "Starting Bitcoin," "Cost Today," "Total You Pay," "Return on Investment," etc.) show outdated information until you change another input (like the growth rate or vesting schedule), at which point all cards update together.

Example: If you increase the bonus from ₿0.002 to ₿0.01 (5x), the carousel still says ₿0.002 and $220, not the correct ₿0.01 and ~$1,100.

This gives a false impression: users might believe their new bonus amount is reflected, but see the old numbers until they nudge another setting.

Math Behind the Cards:
When inputs do update, the calculations appear correct and internally consistent:

Cost Today = Current BTC price × total Bitcoin awarded

Total You Pay = Sum of BTC bonuses × price at assignment

x Return and ROI use compounding at the selected growth rate for the time horizon, as expected.

All metrics recalculate properly with changes to vesting schedule, growth rate, or plan.

Other Concerns:

The cards lack explanatory tooltips or links, which could help clarify the sometimes aggressive growth multiples and ROI projections for less technical users.

The “Cost Basis” math and “Projected Value” numbers are correct as long as input changes propagate, but if a user only edits the BTC amount, it’s easy to misinterpret the projections.

