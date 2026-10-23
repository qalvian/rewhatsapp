// @ts-check

/**
 * Fictional synthetic demo chat for rewhatsapp (~300 messages).
 *
 * Characters:
 * - Maya Chen (curator & architecture student, quick-witted, sends photos and voice notes)
 * - Leo Silva (timber architect, thoughtful, late-night drafter)
 *
 * Narrative Arc:
 * 1. Awkward first hello after meeting at a rainy gallery opening (Feb 14)
 * 2. Flirty banter, inside jokes, playlist exchanges, and voice notes (Feb 15–17)
 * 3. The misunderstanding & emergency site collapse (Feb 18)
 * 4. 3-day quiet gap (>72h triggering Smart Time skip chip) (Feb 19–22)
 * 5. Late-night vulnerability, deleted message confession & heartfelt apology (Feb 22 night)
 * 6. Sweet reunion, noodle date, weekend sketches & quiet domestic joy (Feb 23–26)
 *
 * Features exercised:
 * - Multi-line messages
 * - Extended emoji & ZWJ sequences
 * - Media placeholders (<Media omitted>, photo, sticker, voice note)
 * - Deleted message ("This message was deleted")
 * - Multi-day gap triggering time-skip chip
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
[16/02/2024, 09:15:20] Leo Silva: Morning! Did you survive the studio critique aftermath?
[16/02/2024, 09:22:11] Maya Chen: Barely. Running purely on espresso and adrenaline.
[16/02/2024, 09:23:40] Maya Chen: But my professor said "this shows a surprisingly mature spatial restraint" which in architecture speak is essentially a standing ovation.
[16/02/2024, 09:25:05] Leo Silva: High praise from the black-turtleneck brigade!
[16/02/2024, 13:10:05] Leo Silva: Emergency: my firm ordered 40 pastéis de nata for the project launch and half the team is remote today.
[16/02/2024, 13:11:40] Maya Chen: Leo do NOT tease me when I'm surviving on instant noodles in the workshop
[16/02/2024, 13:13:02] Leo Silva: Box of 6 inbound to your studio lobby via courier. Warm with cinnamon.
[16/02/2024, 13:14:20] Maya Chen: WHAT?!
[16/02/2024, 13:14:35] Maya Chen: You did not just do that!
[16/02/2024, 13:22:15] Maya Chen: <Media omitted>
[16/02/2024, 13:22:40] Maya Chen: They just arrived!! You are unreal Leo Silva. Pure magic.
[16/02/2024, 13:24:10] Leo Silva: Haha enjoy every bite! You earned it.
[16/02/2024, 16:45:00] Maya Chen: My studio mates are treating me like royalty because of you.
[16/02/2024, 16:46:12] Maya Chen: Elena literally asked "who is this mysterious pastry benefactor and is he single"
[16/02/2024, 16:47:30] Leo Silva: What did you tell her? 👀
[16/02/2024, 16:48:50] Maya Chen: I told her he's a timber architect who cares too much about doorframes.
[16/02/2024, 16:50:10] Leo Silva: Devastating accuracy.
[16/02/2024, 20:05:15] Leo Silva: <Media omitted>
[16/02/2024, 20:06:00] Leo Silva: Model of the river pavilion we just finished laser cutting.
[16/02/2024, 20:08:22] Maya Chen: Oh that joinery is gorgeous Leo! Is that Japanese cedar?
[16/02/2024, 20:09:45] Leo Silva: Douglas fir actually! But we treated the exterior with traditional shou sugi ban charred finish.
[16/02/2024, 20:11:10] Maya Chen: The black matte charring with the pale wood inside... that contrast is poetry.
[16/02/2024, 20:12:40] Leo Silva: You really understand what I'm trying to build. That means a lot.
[16/02/2024, 23:18:00] Maya Chen: Audio omitted
[16/02/2024, 23:20:15] Leo Silva: Audio omitted
[16/02/2024, 23:22:40] Maya Chen: You sound exhausted Leo. Put the scalpel down!
[16/02/2024, 23:24:10] Leo Silva: Heading out now. Looking at the stars over London Bridge.
[16/02/2024, 23:25:30] Maya Chen: See you in the morning.
[16/02/2024, 23:26:05] Leo Silva: Sleep tight Maya ✨
[17/02/2024, 10:30:15] Leo Silva: Weekend has arrived!
[17/02/2024, 10:32:40] Maya Chen: The sweetest words in the English language.
[17/02/2024, 12:15:00] Maya Chen: <Media omitted>
[17/02/2024, 12:15:30] Maya Chen: Look at this ridiculous cat outside the bookstore. Refused to move for the delivery van.
[17/02/2024, 12:17:10] Leo Silva: An absolute king. He owns that sidewalk.
[17/02/2024, 15:40:20] Leo Silva: Are we still on for the museum late opening tomorrow?
[17/02/2024, 15:42:15] Maya Chen: Absolutely! 7:00 pm by the entrance fountain?
[17/02/2024, 15:43:00] Maya Chen: I found this tiny ramen place around the corner for afterwards too.
[17/02/2024, 15:44:20] Leo Silva: Sounds like a perfect Saturday plan.
[17/02/2024, 19:10:05] Maya Chen: I'm making a mini checklist of the exhibits we can't miss:
1. The 1920s Bauhaus prototype furniture
2. The kinetic light installation in room 4
3. Whatever room has the least pretentious wall text
[17/02/2024, 19:12:30] Leo Silva: Haha! Number 3 might be an empty room then.
[17/02/2024, 21:05:40] Leo Silva: Can't wait for tomorrow Maya.
[17/02/2024, 21:08:15] Maya Chen: Me neither Leo 😊
[18/02/2024, 10:14:00] Leo Silva: Happy Saturday! See you tonight at 7.
[18/02/2024, 10:16:22] Maya Chen: See you tonight! Don't wear your fancy jacket if we're eating spicy ramen haha
[18/02/2024, 10:18:00] Leo Silva: Duly noted. Apron will be requested.
[18/02/2024, 16:30:10] Maya Chen: Left studio early to get ready. The weather is so moody today, perfect for modern art.
[18/02/2024, 17:15:00] Maya Chen: On the bus now! Heading towards the South Bank.
[18/02/2024, 18:15:30] Leo Silva: Hey Maya, something urgent just came up at the site in Southwark. A retaining wall shifted during excavation and the structural engineer needs me on site right now.
[18/02/2024, 18:16:45] Leo Silva: I'm so sorry, I don't think I can make it by 7...
[18/02/2024, 18:30:10] Maya Chen: Oh.
[18/02/2024, 18:31:05] Maya Chen: I'm already sitting on the bench by the fountain.
[18/02/2024, 18:33:40] Leo Silva: I'm really sorry Maya. I literally got pulled into the project car 10 minutes ago. My boss is frantic and the city inspector is threatening a stop-work order.
[18/02/2024, 18:36:15] Maya Chen: It's fine. Work comes first, I get it.
[18/02/2024, 18:38:00] Leo Silva: Can we do tomorrow instead? I'll make it up to you, I promise.
[18/02/2024, 18:42:10] Leo Silva: Maya? Are you okay?
[18/02/2024, 18:50:22] Maya Chen: I have family dinner tomorrow. Let's just catch up next week sometime.
[18/02/2024, 18:52:00] Maya Chen: It's just cold out here and I was really looking forward to this.
[18/02/2024, 18:54:15] Leo Silva: I know. I hate this so much. Please take an Uber home and send me the receipt.
[18/02/2024, 18:56:40] Maya Chen: I don't need you to pay for my cab Leo. I'm taking the bus.
[18/02/2024, 19:02:40] Leo Silva: Maya, please don't be upset with me. It truly wasn't in my control.
[18/02/2024, 19:45:10] Leo Silva: We're shoring up the basement trench now. Mud everywhere.
[18/02/2024, 21:40:15] Leo Silva: Just finished at the site. It was an absolute mess. Hope you got home warm and safe.
[18/02/2024, 22:30:00] Leo Silva: Still awake?
[18/02/2024, 23:15:00] Leo Silva: This message was deleted
[19/02/2024, 08:30:12] Leo Silva: Morning Maya. Still thinking about last night. Hope you have a restful Sunday with your family.
[22/02/2024, 23:14:05] Maya Chen: Hey.
[22/02/2024, 23:15:30] Leo Silva: Hey! You're awake.
[22/02/2024, 23:17:10] Maya Chen: I'm sorry for being cold on Saturday.
[22/02/2024, 23:17:55] Maya Chen: I was having a really rough week and had built up that evening in my head as this magical escape. When it got cancelled, I took it out on you, which wasn't fair.
[22/02/2024, 23:20:45] Leo Silva: Maya... thank you for saying that.
[22/02/2024, 23:22:10] Leo Silva: But you really didn't have to apologize. I hated leaving you hanging at the fountain in the cold. I was kicking myself all night on that muddy building site.
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
[23/02/2024, 12:28:10] Leo Silva: Booth in the corner by the paper lanterns!
[23/02/2024, 12:31:05] Maya Chen: Walking in right now!
[23/02/2024, 13:45:10] Maya Chen: <Media omitted>
[23/02/2024, 13:46:02] Maya Chen: Proof that you couldn't handle the level 4 chili oil 😂
[23/02/2024, 13:47:30] Leo Silva: My pride is wounded but my heart is very happy.
[23/02/2024, 13:48:40] Maya Chen: Same here Leo. Same here. 🥰
[23/02/2024, 15:10:00] Leo Silva: Walking through Lincoln's Inn Fields back to the studio. That was the best lunch I've had all year.
[23/02/2024, 15:12:15] Maya Chen: Even with the watery chili tears?
[23/02/2024, 15:13:30] Leo Silva: Especially with the tears. It showed emotional range.
[23/02/2024, 17:40:05] Maya Chen: <Media omitted>
[23/02/2024, 17:41:20] Maya Chen: Quick sketch I did on the napkin while you were paying for the tea.
[23/02/2024, 17:43:00] Leo Silva: Maya! You captured the steam rising from the broth perfectly.
[23/02/2024, 17:44:12] Leo Silva: Framing this immediately.
[23/02/2024, 19:30:00] Leo Silva: What are you doing this Sunday?
[23/02/2024, 19:32:15] Maya Chen: Finishing my conservation thesis drawings. Why?
[23/02/2024, 19:34:00] Leo Silva: Want to work together at the Barbican conservatory? Among the ferns and brutalist concrete?
[23/02/2024, 19:35:45] Maya Chen: Concrete AND tropical foliage?? You know the key to my heart.
[23/02/2024, 19:37:10] Leo Silva: I'll bring the thermoses of coffee.
[23/02/2024, 22:15:30] Maya Chen: Audio omitted
[23/02/2024, 22:17:00] Leo Silva: Your voice notes always calm my head down after chaotic project meetings.
[23/02/2024, 22:18:25] Maya Chen: Good. That's what they're prescribed for.
[23/02/2024, 22:20:00] Leo Silva: Sweet dreams Maya.
[23/02/2024, 22:21:10] Maya Chen: Sleep well Leo 🌙
[24/02/2024, 11:05:00] Leo Silva: Question: on scale of 1 to 10 how bad is it if my presentation slides have 15 different fonts
[24/02/2024, 11:06:20] Maya Chen: Leo.
[24/02/2024, 11:06:35] Maya Chen: LEO.
[24/02/2024, 11:07:15] Maya Chen: That is a crime punishable by immediate expulsion from the Royal Institute of British Architects.
[24/02/2024, 11:08:40] Leo Silva: Okay okay! I'll stick to Helvetica and Neue Haas Grotesk!
[24/02/2024, 11:09:50] Maya Chen: Thank you for preserving typographic civilization.
[24/02/2024, 14:20:10] Maya Chen: Just found a vintage 1978 architectural monograph on Alvar Aalto in the charity shop for £3!
[24/02/2024, 14:22:00] Leo Silva: NO WAY! That monograph is out of print everywhere!
[24/02/2024, 14:23:15] Maya Chen: It has foldout section drawings of Villa Mairea in the back!
[24/02/2024, 14:24:40] Leo Silva: Bringing you the best pastries in London tomorrow as an offering to see it.
[24/02/2024, 17:50:00] Leo Silva: <Media omitted>
[24/02/2024, 17:51:10] Leo Silva: Sun hitting the Barbican towers right now. Setting up our spot for tomorrow.
[24/02/2024, 17:52:30] Maya Chen: It's breathtaking. See you at 10 am by the highwalk bridge?
[24/02/2024, 17:53:15] Leo Silva: 10 am sharp.
[25/02/2024, 09:50:10] Leo Silva: I have acquired:
- 2 black coffees
- 2 almond croissants
- A 5-meter tape measure (just in case)
[25/02/2024, 09:52:30] Maya Chen: The tape measure is essential. Coming up the escalator!
[25/02/2024, 14:15:20] Maya Chen: <Media omitted>
[25/02/2024, 14:16:05] Maya Chen: Leo in his natural habitat: deeply studying a concrete expansion joint surrounded by monsteras.
[25/02/2024, 14:18:10] Leo Silva: Hey! I was admiring the drainage detailing!
[25/02/2024, 14:19:25] Maya Chen: Sure you were, dork 🥰
[25/02/2024, 18:30:00] Leo Silva: Best Sunday ever.
[25/02/2024, 18:31:45] Maya Chen: It really was. We got so much drawing done too.
[25/02/2024, 21:10:15] Maya Chen: Audio omitted
[25/02/2024, 21:12:00] Leo Silva: Audio omitted
[25/02/2024, 21:15:30] Maya Chen: I'm really glad you ran after me with that sketchbook on Valentine's Day, Leo.
[25/02/2024, 21:17:10] Leo Silva: Me too, Maya. Best sprint of my life.
[25/02/2024, 21:18:40] Maya Chen: Goodnight, architect ❤️
[25/02/2024, 21:19:25] Leo Silva: Goodnight, Maya. See you in my sketches ✨
[26/02/2024, 08:30:00] Leo Silva: Morning! Ready to conquer another week?
[26/02/2024, 08:32:15] Maya Chen: Ready as I'll ever be. Coffee first though! ☕
[26/02/2024, 08:33:00] Leo Silva: Always coffee first. Have a beautiful Monday Maya.`;
