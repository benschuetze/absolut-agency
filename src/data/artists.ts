import abscure from '../assets/artists/abscure.webp';
import alFatmalay from '../assets/artists/al-fatmalay.webp';
import bjornDelTogno from '../assets/artists/bjorn-del-togno.webp';
import contrast from '../assets/artists/contrast.webp';
import floVon from '../assets/artists/flo-von.webp';
import jona from '../assets/artists/jona.webp';
import leaLindner from '../assets/artists/lea-lindner.webp';
import vonSchwind from '../assets/artists/vonschwind.webp';
import sdb from '../assets/artists/sdb.webp';
import tonyMejeh from '../assets/artists/tony-mejeh.webp';

/**
 * The interview every artist answered, in the order it is asked.
 *
 * Questions live here rather than beside each answer so that the wording stays
 * identical across the roster — eleven copies of a question is eleven chances
 * for one of them to drift. Key order is render order, and an artist who did
 * not answer one simply has no entry: the question then goes unasked rather
 * than appearing empty.
 */
export const PROFILE_QUESTIONS = {
  since: 'How long have you been DJing?',
  sound: 'How would you describe your sound?',
  firstGig: 'Where was your first gig?',
  inspirations: 'Which artists inspire you?',
  longestSet: 'What’s the longest set you’ve played?',
  bestMoment: 'What’s your best moment behind the decks?',
  quirk: 'What’s your biggest DJ quirk?',
  greatNight: 'What makes a great night for you?',
  superpower: 'What’s your superpower?',
} as const;

export type ProfileKey = keyof typeof PROFILE_QUESTIONS;
export type Profile = Partial<Record<ProfileKey, string>>;

export type Artist = {
  /** Stable slug — used as React key, artwork seed, and the future artist route. */
  id: string;
  name: string;
  /** What they play on — vinyl, digital, live — as they answered it. */
  format?: string;
  /** The genre, as the agency labels it. First one is shown on the card. */
  tags?: string[];
  links?: {
    instagram?: string;
    soundcloud?: string;
    /**
     * Anything without an established glyph. One destination links straight
     * out; several turn the mark into a chooser.
     */
    other?: { label: string; to: { label: string; href: string }[] };
  };
  profile?: Profile;
  /**
   * Anything that falls outside the interview — a label, a side project.
   *
   * Names in the body link out: `links.other` plus anyone in `mentions`. The
   * first mention of each name becomes the link, so every address is written
   * down once and the prose stays prose.
   */
  note?: {
    title: string;
    body: string;
    mentions?: { label: string; href: string }[];
  };
  /**
   * Drop a real photo in `src/assets/artists/` and import it here.
   * While this is undefined a generative tile is drawn instead, so the layout
   * is already correct at final proportions (4:5).
   */
  photo?: string;
};

/**
 * The roster.
 *
 * Every word here comes from the artist. Answers are reproduced as they were
 * given, down to the emoji and the asides — an interview that has been smoothed
 * out reads like a press release, which is the opposite of the point. Tidying
 * those away was exactly that mistake, made once already.
 * The only editorial act is `tags`: the genre, as the agency labels it.
 *
 * Nothing is invented. Where an answer is missing the field is left out, and
 * the page drops the question rather than filling the gap.
 */
const roster: Artist[] = [
  {
    id: 'abscure',
    name: 'Abscure',
    format: 'Digital in the club, vinyl at home',
    tags: ['techno'],
    links: {
      instagram: 'https://www.instagram.com/abscur.e',
      soundcloud: 'https://soundcloud.com/abscure333',
    },
    profile: {
      since: '2020',
      sound: 'For me it’s important to keep things minimalistic — nothing too flashy. On the darker side, but with a guiding light. Without light, there can be no shadow.',
      firstGig: 'Silodom, Saarbrücken.',
      inspirations:
        'Way too many to mention, and it changes a lot over time — right now I’m into the raw style of Talismann. There are also so many great artists on labels like SK11, Somov, Mutual Rytm — you name it. One artist who’s excited me for years, under any of his aliases — Prince of Denmark, Traumprinz, DJ Metatron — is a constant. I also keep coming back to Markus Suckut’s and Donato Dozzy’s releases. But the most influential of all time, without question, is Linkin Park.',
      longestSet: '5 hours.',
      bestMoment: 'Playing my own tracks at the legendary Tresor club — definitely the most fulfilling moment so far.',
      quirk: 'I turn into a total mouthbreather the second someone takes a picture.',
      greatNight: 'Connecting with the crowd, so that everything becomes one.',
      superpower: 'Staying calm when everything’s on fire.',
    },
    photo: abscure,
  },
  {
    id: 'al-fatmalay',
    name: 'Al-Fatmalay',
    format: 'Digital',
    tags: ['cross-cultural'],
    links: {
      instagram: 'https://www.instagram.com/fatimahamido',
      soundcloud: 'https://soundcloud.com/al-fatmalay-331523491',
    },
    profile: {
      since: '2024',
      sound: 'An emotional world trip on a flying Arabic carpet — moving between cultures, memories, languages and moods.',
      firstGig: 'My first gig was at an Arabic drag show in Saarbrücken, Germany.',
      inspirations:
        'I’m inspired by many artists, including some big names, but my biggest inspiration is a mixed-culture audience.',
      longestSet: 'Seven hours.',
      bestMoment:
        'When you turn around and ask yourself and the people around you: “Is this my language that I’m hearing?” That moment when music becomes unexpectedly familiar.',
      quirk: 'Abstract remixes and multilingual vocals — playing with languages as sounds, memories and emotions, rather than just words.',
      greatNight: 'When you leave my set surprised, touched, and maybe with a new perspective.',
      superpower: 'Making music a mutual language that everyone can understand.',
    },
    photo: alFatmalay,
  },
  {
    id: 'bjorn-del-togno',
    name: 'Björn Del Togno',
    format: 'Vinyl, digital, hybrid',
    tags: ['techno'],
    links: {
      instagram: 'https://www.instagram.com/bjoerndeltogno/',
      soundcloud: 'https://soundcloud.com/bj-rn_del_togno',
    },
    profile: {
      since: '2002',
      sound: 'Raw techno, plus minus, with surprises.',
      firstGig: 'Kufa Saarbrücken.',
      inspirations:
        'Electronic: Bjarki, Westbam, Marc Houle, Chemikalien Brothers, Modeselektor, Lea Lindner. Non-electronic: Freddie Mercury, Mick Jagger, Helge Schneider.',
      longestSet: '13 hours.',
      bestMoment:
        'During the pandemic, my girlfriend and I opened the studio windows while jamming. People out for their permitted daily walks started stopping to listen and dance. The crowd kept growing and growing. Seeing music bring so much joy after months of lockdown was unforgettable.',
      quirk: 'Sometimes I get so into the music, I forget there are people watching. That’s usually when the weird dance moves happen.',
      greatNight:
        'When music, artists, people, space and sound all merge into one: a shared energy you can feel in every cell of your body.',
      superpower:
        'Reading the room. A broad musical repertoire, no fixed formula — just adapting, growing with the crowd, and letting the night unfold.',
    },
    photo: bjornDelTogno,
  },
  {
    id: 'contrast',
    name: 'Cøntrast',
    format: 'Digital for now, and hopefully live soon',
    tags: ['techno', 'groove', 'breaks'],
    links: {
      instagram: 'https://www.instagram.com/_contrast_music',
      soundcloud: 'https://soundcloud.com/contrastvirgae',
    },
    profile: {
      since: 'Professionally since 2021',
      sound: 'A subtle blend of techno, groove and breaks. I like to fuse my different inspirations during my sets and when I’m producing.',
      firstGig:
        'At a small rave party. I played the warm-up, and I was the only female DJ at the party. That was back in 2015.',
      inspirations:
        'David Bowie has always held an important place in my life, just like Pink Floyd, ever since I was very young. When it comes to techno, I think of Marcel Dettmann, Richie Hawtin, among others, who are legends of the genre and have managed to reinvent themselves over the decades. Finally, the new generation inspires me a lot, with artists such as Hadone, Askkin, Trudge, Mara Menace, and ANNÉ.',
      longestSet: '3 hours in clubs, or 6 hours for an afterparty.',
      bestMoment:
        'When I started playing my own productions. It brings up a lot of emotions for me to play them and see the crowd enjoying them just as much as “pro” tracks.',
      quirk: 'Way too much stress haha (good one, I hope ^^)',
      greatNight:
        'A good sound system, an open-minded and curious crowd, and most importantly, genuine human connections between artists and organizers.',
      superpower: 'Originality.',
    },
    photo: contrast,
  },
  {
    id: 'flo-von',
    name: 'Flo.Von',
    format: 'Digital',
    tags: ['tech house'],
    links: {
      instagram: 'https://www.instagram.com/flo.von',
      soundcloud: 'https://soundcloud.com/flovon',
      other: {
        label: 'zerrro',
        to: [
          { label: 'instagram', href: 'https://www.instagram.com/zerrro_music' },
          { label: 'website', href: 'https://zerrromusic.com' },
        ],
      },
    },
    profile: {
      since: 'Not long enough to get tired of it',
      sound: 'Techy, soulful, dubby house.',
      firstGig: 'I don’t really care about the first one. I’m more interested in the next one.',
      inspirations:
        'I’m not really inspired by specific artists. I’m inspired by music itself, and especially by the emotions and feelings it can create. Even more than the music, I’m inspired by what you experience around it.',
      longestSet: '8 hours. Somehow, it didn’t feel that long.',
      bestMoment:
        'Playing my own music and seeing people react to it in a way that feels exactly like what I felt when I made it.',
      quirk: 'Knowing the exact pitch percentage on the CDJs. No idea why, but I need to know.',
      greatNight: 'Good vibes, playing my own productions, and forgetting about everything else for a few hours.',
      superpower: 'Finding my own sound, and continuing to develop it without losing what makes it mine.',
    },
    note: {
      title: 'Good to know',
      mentions: [
        { label: 'Tim Klein', href: 'https://www.instagram.com/timklein_/' },
        { label: 'Max Metzinger', href: 'https://www.instagram.com/maxmetzinger/' },
      ],
      body: 'Besides my own productions and DJ gigs, I started zerrro in 2023 with my friends Tim Klein & Max Metzinger. It’s our little independent label and music project, combining our own releases with curated playlists, sample packs, plugins, mastering services, and a new AI-powered browser version. What’s important to us is not just promoting ourselves or established artists, but supporting smaller artists and giving something back to the scene we’re part of. We work with partners like MuseHub, SubmitHub, Groover and PlaylistPush, and are basically trying to build something useful for artists and producers along the way.',
    },
    photo: floVon,
  },
  {
    id: 'jona',
    name: 'Jona',
    format: 'Digital',
    tags: ['dnb', 'jungle', 'liquid'],
    links: {
      instagram: 'https://www.instagram.com/jona.junglekidz',
      soundcloud: 'https://soundcloud.com/girlsandbass',
    },
    profile: {
      since: '2016',
      sound: 'Very energetic and bassheavy for the most part, but I love a good liquid or jungle set as well.',
      firstGig:
        'Osthafenfest 2016 at Silodom with the whole Junglekidz gang. My first big one on my own was at Cassiopeia Berlin a year later.',
      inspirations:
        'Voltage, EgoTrippin and Document One when it comes to DnB, but I also grew up on hip hop, pop punk and alternative rock and take a lot of influences from there. Too many names to choose from, tbh. When it comes to newer artists I’m a big Doechii stan at the moment — I think she can do everything and isn’t bound to any genre, and I love that about her.',
      longestSet: '7 hours.',
      bestMoment:
        'Junglefeast 2017 at Silodom, because I played 3 different sets on three different floors that night and could showcase my whole range. That was just so fun! An honorable mention has to be the 2-hour b2b with EgoTrippin I did at MsConnexion in Mannheim in 2023. Goosebumps when I think of this.',
      quirk: 'My bassface when I’m into it 😆',
      greatNight:
        'When everyone is aligned with their feelings about the music and strangers become friends because they have such a good time. Coming out of a club, the sun is out already and you have that warm feeling. Nothing compares to that.',
      superpower:
        'I can adapt to a crowd very easily. I love checking people’s faces and energies and making them feel special when I play a tune that matches their mood.',
    },
    photo: jona,
  },
  {
    id: 'lea-lindner',
    name: 'Lea Lindner',
    format: 'Vinyl and digital',
    tags: ['techno', 'oldschool', 'electro'],
    links: {
      instagram: 'https://www.instagram.com/lealindnerdj',
      soundcloud: 'https://soundcloud.com/lealindner',
    },
    profile: {
      since: '2018',
      sound: 'Techno, with a soft spot for oldschool sounds and the occasional touch of electro. I like to experiment and combine different influences, as long as it sounds good.',
      firstGig: 'Electro Magnetic Festival in Völklingen.',
      inspirations:
        'Miss Kittin, Colin Benders, Lady Starlight, Andy Martin, Efdemin, Steffi and Kerrie. Outside electronic music: Madonna, Slipknot and The Cure.',
      longestSet: '10 hours.',
      bestMoment:
        'When I can build a connection with the people in the room and feel that they’re able to forget about time and completely switch off — especially when people tell me afterwards that they experienced exactly that. Or when I discover a new track and see people getting just as excited about it as I am.',
      quirk:
        'I sometimes make notes for my vinyl sets beforehand, which I then don’t even look at. I tend to overthink things beforehand and afterwards focus too much on what could have been better.',
      greatNight:
        'When everything just falls into place and you feel like everything makes sense. And when I leave the night feeling energized rather than drained.',
      superpower:
        'Finding the right balance between taking people somewhere new and giving them what they need in the moment.',
    },
    photo: leaLindner,
  },
  {
    id: 'vonschwind',
    name: 'vonSchwind',
    format: 'Digital',
    tags: ['house'],
    links: {
      instagram: 'https://www.instagram.com/p.von.schwind',
      soundcloud: 'https://soundcloud.com/von-schwind',
    },
    profile: {
      since: '4 years',
      sound: 'A vibrant blend of progressive house, 90s underground dance bangers and influences drawn from every era of queer club culture.',
      firstGig: 'Hunter Thompson.',
      inspirations: 'Björk, Madonna, Deee-Lite, Todd Terry.',
      longestSet: '8 hours.',
      bestMoment:
        'I live for that moment when the crowd completely lets go. When everyone around you is dancing wildly, feeling completely safe, free, and unapologetically themselves. That feeling of connection, of belonging, of a strong, beautiful community.',
      quirk: 'I don’t know if it’s a quirk, but I love to sing or lip-sync a lot of the vocals that I’m playing.',
      greatNight: 'Community. Good music. A lot of dancing. A lot of laughter.',
    },
    photo: vonSchwind,
  },
  {
    id: 'sdb',
    name: 'SDB',
    format: 'Live',
    tags: ['techno'],
    links: {
      instagram: 'https://www.instagram.com/sdb.tracks/',
      soundcloud: 'https://soundcloud.com/sdbsb',
    },
    profile: {
      since: '2018',
      sound: 'Dirty.',
      firstGig: 'At Mauerpfeiffer Saarbrücken.',
      inspirations: 'Regis, Mhonolink, Dave Clarke, Sedvs, Lorn, Meshuggah, Architects.',
      longestSet: '6 hours.',
      bestMoment: 'When I see the people enjoy my music.',
      quirk: 'I always had a nice closing track prepared back when I was still playing DJ sets.',
      greatNight: 'The people, the music and the lights.',
      superpower: 'Love.',
    },
    photo: sdb,
  },
  {
    id: 'tony-mejeh',
    name: 'Tony Mejeh',
    format: 'Digital, but I can play vinyl as well',
    tags: ['tech house', 'vocals', 'groove'],
    links: {
      instagram: 'https://www.instagram.com/tonymejeh',
      soundcloud: 'https://soundcloud.com/infernooff',
    },
    profile: {
      since: '2018',
      sound: 'Very versatile. Some sets are faster, some a bit slower, but in general you can expect something groovy, catchy and sexy — uplifting tech house, raw tech house, a lot of vocals and repetitive vocal chops.',
      firstGig: 'At the lovely Silodom in Saarbrücken.',
      inspirations:
        'Green Velvet, PAWSA, Patrick Topping and a lot more when it comes to electronic. Michael Jackson is my biggest inspiration beyond electronic music.',
      longestSet: '11 hours without a toilet break 😂😂',
      bestMoment:
        'When the gathering of every single person on the dance floor starts to begin by yelling and cheering and celebrating the moment we share together. When this typical lip biting starts to begin just because the music is developing with a lot of tension. And when I start getting goosebumps because the music touches my heart so deeply.',
      quirk:
        'I always have to beatmatch with only one ear covered by the headphones, using the other ear to listen to the monitors 🫠',
      greatNight:
        'When I don’t mind that I forgot to record the set, because I know for sure how good it was — I can always remember it from my mind, just because it was so good I’m able to remember every single track.',
      superpower:
        'Dancing while mixing like nobody’s watching me, and spreading this energy all over the dance floor so everybody gets affected from that energy 🫶🏿',
    },
    photo: tonyMejeh,
  },
];

/**
 * Sorted here rather than by hand, so new entries can be appended in any order
 * and still land in the right place. `localeCompare` handles the umlaut.
 */
export const artists: Artist[] = [...roster].sort((a, b) => a.name.localeCompare(b.name, 'de'));
