/**
 * The letter: a two word lowercase title, a dateline, sixteen paragraphs and a
 * closing line. Each paragraph names the side it takes below the wide tier, and
 * the three consecutive paragraphs about mass market electronics are pulled to
 * one side together, so the pattern follows the argument rather than a rule.
 */
export const LETTER_TITLE = 'the table';
export const LETTER_DATELINE = 'June 1, 2026';
export const LETTER_CLOSING = 'See you soon.';

export const LETTER_PARAGRAPHS = [
  {
    side: 'left',
    text: 'There is a table in the middle of our workshop. It is a door laid across two filing cabinets, and it has been there since before the company had a name. Every camera we have ever shipped was assembled on it at least once, usually badly the first time.',
  },
  {
    side: 'right',
    text: 'We are eleven people. Four of us design, three build, two answer the telephone and two keep the accounts and the lights on. Nobody here has a title that takes more than two words to say, and the person who answers your email has almost certainly held the camera you are writing about.',
  },
  {
    side: 'left',
    text: 'We make two cameras. The A1 is the large one, full frame, meant to be the last body somebody buys for a decade. The Cricket is small and fixed lens and goes in a coat pocket. That is the whole range. We have been asked many times to make a third and we have not thought of one worth making.',
  },
  {
    side: 'right',
    text: 'The table is where we decide what goes in. A part arrives, we put it on the table, and we ask what it costs, what it weighs, what it breaks, and what happens when it breaks in a place with no post office. If a part cannot survive that conversation it does not go in the camera.',
  },
  // The three consecutive paragraphs about mass market electronics, pulled to
  // one side together.
  {
    side: 'left',
    group: 'mass-market',
    text: 'Most electronics are not made this way. They are made to a price, on a schedule set by a season rather than by a design, and the people who chose the parts have usually moved to another product before the first repair request arrives.',
  },
  {
    side: 'left',
    group: 'mass-market',
    text: 'That is why a four year old device feels slow, why the battery is glued in, why the screws are a shape you cannot buy a driver for, and why the software that talked to it stopped being published the year after you bought it. None of that is an accident. It is the plan working.',
  },
  {
    side: 'left',
    group: 'mass-market',
    text: 'We are not better people than the people who make those things. We are simply small enough that we cannot hide from the consequences. If we glue a battery in, the person who has to explain it to you sits four metres from the table.',
  },
  {
    side: 'right',
    text: 'So the backs of our cameras come off with four screws, and they are ordinary screws. The battery is a rectangle you can hold. The service manual is printed and put in the box, not hidden behind a login on a site that will be retired.',
  },
  {
    side: 'left',
    text: 'We publish every part number we use. If a shutter fails outside its warranty we will sell you the shutter, and if you would rather we fit it, we will fit it and tell you what it cost us before we tell you what it costs you.',
  },
  {
    side: 'right',
    text: 'The software is called Arranger and it is free, because a camera that needs a subscription to hand you your own photographs is not a camera you own. It reads a folder where you put it and it never moves a file you did not ask it to move.',
  },
  {
    side: 'left',
    text: 'We keep every version of it we have ever released, with the notes we wrote at the time, including the notes about the mistakes. A release archive that quietly loses its older entries is a company editing its own history, and we would rather you could read ours.',
  },
  {
    side: 'right',
    text: 'A camera outlives the order that bought it. This is the part most shops get wrong. The receipt is a moment and the camera is a life, so a serial number here is a record in its own right, with an owner that can be handed on when you sell it and released when you are done.',
  },
  {
    side: 'left',
    text: 'That is also why we will repair a camera registered to somebody else. If it is on our bench and it is ours to fix, the paperwork is not the point. We ask who owns it so we know where to send it back, not to decide whether it deserves help.',
  },
  {
    side: 'right',
    text: 'We support a camera for at least six years after we stop selling it, and we say the date out loud on the page rather than burying it. The Monitor Mount is discontinued and its date is on its page, which is more than we can say for most of the things on our own desks.',
  },
  {
    side: 'left',
    text: 'None of this is charity. Cameras that last make people who come back, and people who come back cost far less to find than people who have never heard of us. It happens to be that the honest version and the durable business are the same shape.',
  },
  {
    side: 'right',
    text: 'If you buy something from us, it will arrive in a box with a manual and a cable and a camera that somebody here held before it was sealed. If it stops working, write to us. The table is still there, and so are we.',
  },
];
