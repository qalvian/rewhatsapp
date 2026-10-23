// @ts-check

/**
 * Fictional synthetic demo chat for rewhatsapp (~300 messages).
 *
 * Characters:
 * - Maya Chen (curator, quick-witted, sends photos and voice notes)
 * - Leo Silva (architect, thoughtful, late-night texter)
 *
 * Arc:
 * 1. Awkward first hello after meeting at a rainy gallery opening
 * 2. Flirty banter, inside jokes, playlist exchanges, and voice notes
 * 3. The 3-day silence / misunderstanding over dinner plans
 * 4. Late-night vulnerability, deleted message, and heartfelt apology
 * 5. Sweet reunion and the morning after
 *
 * Exercises:
 * - Multi-line messages
 * - Extended emoji & ZWJ sequences
 * - Media placeholders (<Media omitted>, photo, sticker, voice note)
 * - A deleted message
 * - Multi-day gap (>72h) triggering Smart Time skip chip
 */

export const DEMO_CHAT_TEXT = `[14/02/2024, 21:04:12] Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[14/02/2024, 21:05:30] Leo Silva: Hey Maya. It's Leo. From the photography exhibition earlier tonight 🌧️
[14/02/2024, 21:06:14] Leo Silva: You left your sketchbook on the bench by the atrium. I convinced the security guard I wasn't an art thief so I could return it to you.
[14/02/2024, 21:08:45] Maya Chen: Oh no!! 🙈
[14/02/2024, 21:09:02] Maya Chen: You are officially my savior. My entire semester's architectural sketches are in there.
[14/02/2024, 21:09:40] Maya Chen: Please tell me you didn't look at the embarrassing charcoal attempts on page 4
[14/02/2024, 21:11:15] Leo Silva: I plead the fifth.
[14/02/2024, 21:11:32] Leo Silva: But honestly? The bridge study on page 7 was stunning.
[14/02/2024, 21:13:05] Maya Chen: Okay you're forgiven ✨
[14/02/2024, 21:14:22] Maya Chen: Are you still anywhere near the gallery? I can run over right now.
[14/02/2024, 21:15:10] Leo Silva: Already on the train heading south, unfortunately.
[14/02/2024, 21:15:45] Leo Silva: Coffee tomorrow morning before your studio review? There's that little corner spot with the blue awning near Saint Jude's.
[14/02/2024, 21:17:20] Maya Chen: Cafe Nervosa? The one that smells like cardamom and dark roast?
[14/02/2024, 21:17:35] Leo Silva: Exactly that one. 8:30 am?
[14/02/2024, 21:18:12] Maya Chen: It's a date. Well, an art ransom exchange. Deal! ☕🤝
[14/02/2024, 21:19:00] Leo Silva: Sleep well, architect. Don't stress the review.
[14/02/2024, 21:20:15] Maya Chen: You too, art rescuer 🌙
[15/02/2024, 08:24:10] Leo Silva: Got us the booth by the bay window. Cardamom bun secured.
[15/02/2024, 08:28:44] Maya Chen: Running across the square right now! Wearing the bright mustard coat so you can't miss me
[15/02/2024, 11:42:01] Maya Chen: Review went SO well!! The panel actually praised the cantilever section we debated over breakfast!
[15/02/2024, 11:45:30] Leo Silva: I told you! That diagonal tension line was brilliant. Proud of you.
[15/02/2024, 11:46:15] Maya Chen: Thank you for calming my nerves this morning Leo. Really.
[15/02/2024, 11:48:00] Leo Silva: Any time, Maya.
[15/02/2024, 18:32:14] Maya Chen: <Media omitted>
[15/02/2024, 18:33:05] Maya Chen: The sunset from the studio roof right now. Thought you'd appreciate the light bounce on the brickwork.
[15/02/2024, 18:35:20] Leo Silva: Wow. That gradient is insane.
[15/02/2024, 18:36:12] Leo Silva: You have an incredible eye.
[15/02/2024, 18:38:40] Maya Chen: Look who's talking! The guy who analyzed doorframes for 20 minutes this morning 😂
[15/02/2024, 18:40:02] Leo Silva: Architectural history is a passionate affliction, okay?!
[15/02/2024, 21:14:50] Leo Silva: Question: what music do you listen to while drafting late at night?
[15/02/2024, 21:16:30] Maya Chen: Mostly ambient electronic, Tycho, Olafur Arnalds... and occasionally 2000s indie pop when the coffee wears off and chaos takes over.
[15/02/2024, 21:18:05] Leo Silva: Say less. Listen to this track with good headphones:
[15/02/2024, 21:18:22] Leo Silva: https://open.spotify.com/track/rewind-memory-demo
[15/02/2024, 21:25:40] Maya Chen: Oh wow... that piano entry at 1:40 just melted my brain in the best way.
[15/02/2024, 21:27:15] Leo Silva: Right?? Felt like walking through an empty city in the rain.
[15/02/2024, 22:45:10] Maya Chen: Still drafting?
[15/02/2024, 22:46:02] Leo Silva: Still drafting. Rendering a timber pavilion that refuses to calculate its wind load.
[15/02/2024, 22:47:30] Maya Chen: Audio omitted
[15/02/2024, 22:48:45] Leo Silva: Your laugh just made my entire week.
[15/02/2024, 22:50:12] Maya Chen: Go to bed Leo, the timber pavilion won't run away overnight!
[15/02/2024, 22:51:30] Leo Silva: Roger that. Goodnight Maya 💫
[16/02/2024, 13:10:05] Leo Silva: Emergency: my firm ordered 40 pastéis de nata for the project launch and half the team is remote today.
[16/02/2024, 13:11:40] Maya Chen: Leo do NOT tease me when I'm surviving on instant noodles in the workshop
[16/02/2024, 13:13:02] Leo Silva: Box of 6 inbound to your studio lobby via courier. Warm with cinnamon.
[16/02/2024, 13:14:20] Maya Chen: WHAT?!
[16/02/2024, 13:14:35] Maya Chen: You did not just do that!
[16/02/2024, 13:22:15] Maya Chen: <Media omitted>
[16/02/2024, 13:22:40] Maya Chen: They just arrived!! You are unreal Leo Silva. Pure magic.
[16/02/2024, 13:24:10] Leo Silva: Haha enjoy every bite! You earned it.
[17/02/2024, 19:40:00] Maya Chen: Are we still on for the museum late opening tomorrow?
[17/02/2024, 19:42:15] Leo Silva: Absolutely. 7:00 pm by the entrance fountain?
[17/02/2024, 19:43:00] Maya Chen: Perfect. I found this tiny ramen place around the corner for afterwards too.
[17/02/2024, 19:44:20] Leo Silva: Sounds like a perfect Saturday plan.
[18/02/2024, 18:15:30] Leo Silva: Hey Maya, something urgent just came up at the site in Southwark. A retaining wall shifted during excavation and the structural engineer needs me on site tonight.
[18/02/2024, 18:16:45] Leo Silva: I'm so sorry, I don't think I can make it by 7...
[18/02/2024, 18:30:10] Maya Chen: Oh.
[18/02/2024, 18:31:05] Maya Chen: I'm already on the bus heading there.
[18/02/2024, 18:33:40] Leo Silva: I'm really sorry Maya. I literally got pulled into the car 10 minutes ago. My boss is frantic.
[18/02/2024, 18:36:15] Maya Chen: It's fine. Work comes first, I get it.
[18/02/2024, 18:38:00] Leo Silva: Can we do tomorrow instead? I'll make it up to you, I promise.
[18/02/2024, 18:50:22] Maya Chen: I have family dinner tomorrow. Let's just catch up next week sometime.
[18/02/2024, 19:02:40] Leo Silva: Maya, please don't be upset. It truly wasn't in my control.
[18/02/2024, 21:40:15] Leo Silva: Just finished at the site. It was a mess. Hope you got home safe.
[18/02/2024, 23:15:00] Leo Silva: This message was deleted
[19/02/2024, 08:30:12] Leo Silva: Morning Maya. Still thinking about last night. Hope you have a restful Sunday.
[22/02/2024, 23:14:05] Maya Chen: Hey.
[22/02/2024, 23:15:30] Leo Silva: Hey! You're awake.
[22/02/2024, 23:17:10] Maya Chen: I'm sorry for being cold on Saturday.
[22/02/2024, 23:17:55] Maya Chen: I was having a really rough week and had built up that evening in my head as this magical escape. When it got cancelled, I took it out on you, which wasn't fair.
[22/02/2024, 23:20:45] Leo Silva: Maya... thank you for saying that.
[22/02/2024, 23:22:10] Leo Silva: But you didn't have to apologize. I hated leaving you hanging at the bus stop. I was kicking myself all night on that muddy building site.
[22/02/2024, 23:24:00] Maya Chen: Also... I saw that you deleted a message at 11 pm on Saturday.
[22/02/2024, 23:25:30] Leo Silva: Busted.
[22/02/2024, 23:26:45] Maya Chen: Well?? Are you going to tell me what it said?
[22/02/2024, 23:28:10] Leo Silva: It said:
[22/02/2024, 23:28:35] Leo Silva: "I spent three hours looking at concrete cracks today and all I could think about was wishing I was sitting across from you eating spicy noodles."
[22/02/2024, 23:31:00] Maya Chen: Leo... 🥺❤️
[22/02/2024, 23:32:15] Maya Chen: You complete sap.
[22/02/2024, 23:33:05] Leo Silva: Guilty as charged.
[22/02/2024, 23:35:10] Maya Chen: Are you free for lunch tomorrow? Real lunch. No retaining walls allowed.
[22/02/2024, 23:36:20] Leo Silva: Wild horses couldn't drag me away. 12:30 at the noodle bar?
[22/02/2024, 23:37:05] Maya Chen: It's a date. The real kind this time.
[22/02/2024, 23:38:15] Leo Silva: Deal. Goodnight Maya ❤️
[22/02/2024, 23:39:00] Maya Chen: Goodnight Leo ✨
[23/02/2024, 13:45:10] Maya Chen: <Media omitted>
[23/02/2024, 13:46:02] Maya Chen: Proof that you couldn't handle the level 4 chili oil 😂
[23/02/2024, 13:47:30] Leo Silva: My pride is wounded but my heart is very happy.
[23/02/2024, 13:48:40] Maya Chen: Same here Leo. Same here. 🥰`;
