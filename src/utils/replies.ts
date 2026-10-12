import {
  chatgptGreetingReplies,
  messengerGenericReplies,
  messengerGreetingReplies,
  messengerQuestionReplies } from
'../data/replies';

const GREETING = /^(hi|hey|hello|yo|sup|hiya|heyy+|good (morning|evening|afternoon))\b/i;

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function messengerReply(text: string): string {
  if (GREETING.test(text.trim())) return pick(messengerGreetingReplies);
  if (text.trim().endsWith('?')) return pick(messengerQuestionReplies);
  return pick(messengerGenericReplies);
}

export function chatgptReply(text: string): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (GREETING.test(clean) && clean.length < 24) return pick(chatgptGreetingReplies);
  const topic = clean.length > 60 ? `${clean.slice(0, 57).trimEnd()}…` : clean.replace(/[?.!]+$/, '');

  const templates = [
  `Great question! Here’s a clear way to think about **${topic}**.

### The short answer
It depends on what you’re optimizing for, but most people get the best results by starting small, validating quickly, and iterating from there.

### Key points
- **Start with the goal.** Write down what “done” looks like before choosing an approach.
- **Keep it simple.** The most straightforward option usually wins until you have a reason to change it.
- **Measure as you go.** Small feedback loops beat big up-front plans.

If you share a bit more context, I can tailor this to your exact situation.`,
  `Sure — let’s break down **${topic}** step by step.

1. **Clarify the problem.** Identify the one thing you most need to solve.
2. **List your options.** Two or three realistic paths are plenty.
3. **Compare the trade-offs.** Think about time, cost, and how reversible each choice is.
4. **Pick one and try it.** You’ll learn more from a quick attempt than from more research.

Want me to go deeper on any of these steps?`,
  `Here’s a quick overview of **${topic}**:

It’s helpful to separate what you *know* from what you’re *assuming*. Once those are clear, the next step usually becomes obvious.

- **What matters most:** the outcome you want, not the method.
- **Common pitfall:** trying to solve everything at once.
- **A good first move:** pick the smallest version you can finish today.

Let me know if you’d like examples, a checklist, or a more detailed plan.`];


  return pick(templates);
}