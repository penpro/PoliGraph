/* PoliGraph data layer — axes, question bank, alignment roster with historical dossiers.
   Classic script (no modules) so it runs identically from file:// and GitHub Pages. */
window.PG_DATA = (function () {

  /* ---- The six authoritarian axes. All measure the *instinct to coerce*,
          deliberately decoupled from left/right economics so both tribes score. ---- */
  var AXES = [
    { key: "coercive_moralism",   label: "Coercive moralism",    short: "Moralism",   color: "#7F77DD",
      blurb: "Using state force to impose a personal or religious moral preference." },
    { key: "epistemic_closure",   label: "Epistemic closure",    short: "Censorship", color: "#1D9E75",
      blurb: "Suppressing dissent and 'dangerous' ideas rather than answering them." },
    { key: "autonomy_denial",     label: "Autonomy denial",      short: "Autonomy",   color: "#D85A30",
      blurb: "The state reaching into bodies, clinics, bedrooms, and private choices." },
    { key: "outgroup_punishment", label: "Out-group punishment", short: "Out-group",  color: "#D4537E",
      blurb: "In-group protected; a disfavored group must be constrained or purged." },
    { key: "retributive_impulse", label: "Retributive impulse",  short: "Retribution",color: "#EF9F27",
      blurb: "Reaching for punishment over rehabilitation, due process, or harm reduction." },
    { key: "personalist_deference",label:"Personalist deference", short: "Strongman",  color: "#378ADD",
      blurb: "Loyalty to a leader above rules, courts, and process." }
  ];

  var OPTIONS = [
    { label: "Strongly disagree", value: -2 },
    { label: "Disagree",          value: -1 },
    { label: "Neutral",           value:  0 },
    { label: "Agree",             value:  1 },
    { label: "Strongly agree",    value:  2 }
  ];

  /* ---- Pre-test ----
     Not scored into the axes. It captures (a) the taker's self-image and (b) the traits that
     authoritarian regimes have historically destroyed. On the results page these are turned back
     on the taker: "the regime you matched would have come for THIS part of you."
     Everything stays in memory — none of it is ever stored or sent anywhere. */
  var SELF_SCALES = [
    { id:"safe1", prompt:"My political views are mainstream, moderate, and reasonable." },
    { id:"safe2", prompt:"People like me would have little to fear from a much more powerful government." },
    { id:"safe3", prompt:"If my country ever turned dangerous, I could always just leave or adapt." },
    { id:"safe4", prompt:"The kind of atrocities in the history books couldn't happen to someone like me." }
  ];

  /* Multi-select. Each maps to a target-key that regimes reference below. Optional — leaving all
     unticked is itself an answer (see the Niemöller reveal). */
  var ATTRIBUTES = [
    { key:"ethnicity",         label:"I'm an ethnic or racial minority where I live" },
    { key:"religion_minority", label:"I belong to a minority religion" },
    { key:"religion_devout",   label:"I'm devoutly religious (any faith)" },
    { key:"nonreligious",      label:"I'm atheist or non-religious" },
    { key:"lgbtq",             label:"I'm LGBTQ+" },
    { key:"gender",            label:"I'm a woman, or gender-nonconforming" },
    { key:"immigrant",         label:"I'm an immigrant, or descended from recent immigrants" },
    { key:"disability",        label:"I live with a disability or chronic illness" },
    { key:"wealth",            label:"My family has property or generational wealth" },
    { key:"business",          label:"I own a business" },
    { key:"intelligentsia",    label:"I'm a teacher, journalist, academic, writer, or artist" },
    { key:"labor",             label:"I'm a union member or labor organizer" },
    { key:"dissenter",         label:"I speak out about politics publicly" },
    { key:"gun_owner",         label:"I own firearms" },
    { key:"cultural_minority", label:"I belong to a minority language or cultural group" }
  ];

  /* Regime -> the traits it destroyed, keyed to ATTRIBUTES. Historically specific, kept accurate
     (e.g. the Nazi gun note is the real 1938 law disarming Jews, not the popular myth). */
  var TARGETS = {
    "Adolf Hitler":[
      { key:"ethnicity", note:"Jews, Roma, and Slavs were stripped of rights, then deported and murdered." },
      { key:"religion_minority", note:"Jews and Jehovah's Witnesses were persecuted and killed for their faith." },
      { key:"lgbtq", note:"~100,000 gay men were arrested under Paragraph 175; thousands died in the camps." },
      { key:"disability", note:"~250,000 disabled people were murdered in the T4 'euthanasia' program." },
      { key:"dissenter", note:"Communists, socialists, and critics were the first prisoners at Dachau in 1933." },
      { key:"wealth", note:"Jewish businesses and generational wealth were 'Aryanized' — confiscated and handed to loyalists." },
      { key:"business", note:"Jewish-owned firms were seized and transferred to regime supporters." },
      { key:"intelligentsia", note:"Independent writers, professors, and artists were banned, exiled, or burned out of the canon." },
      { key:"labor", note:"Free trade unions were abolished in 1933 and their leaders arrested." },
      { key:"gun_owner", note:"The 1938 Weapons Law barred Jews from owning firearms — disarming the group about to be deported." }
    ],
    "Joseph Stalin":[
      { key:"wealth", note:"'Kulaks' — peasants with any land or property — were declared class enemies and liquidated." },
      { key:"business", note:"Private traders and the propertied were destroyed 'as a class.'" },
      { key:"dissenter", note:"Any hint of opposition meant the Great Purge: confess or be shot." },
      { key:"intelligentsia", note:"Writers, scientists, and officers were purged in waves." },
      { key:"ethnicity", note:"Whole nationalities — Crimean Tatars, Chechens, Volga Germans — were deported en masse." },
      { key:"religion_devout", note:"Churches were dynamited and clergy executed or sent to the Gulag." },
      { key:"cultural_minority", note:"Minority languages and cultures were crushed under forced Russification." }
    ],
    "Mao Zedong":[
      { key:"intelligentsia", note:"Intellectuals were the 'stinking ninth category,' beaten in struggle sessions or worked to death." },
      { key:"wealth", note:"Landlords were publicly executed; owning property could be a death sentence." },
      { key:"business", note:"Private enterprise was abolished and owners denounced." },
      { key:"dissenter", note:"Criticism invited under the Hundred Flowers campaign got hundreds of thousands purged." },
      { key:"religion_devout", note:"Temples and churches were destroyed and worship suppressed." }
    ],
    "Pol Pot":[
      { key:"intelligentsia", note:"Wearing glasses or speaking a foreign language could get you executed." },
      { key:"wealth", note:"Money, markets, and private property were abolished outright." },
      { key:"business", note:"Merchants and the urban middle class were marched to labor camps." },
      { key:"religion_devout", note:"Buddhist monks were defrocked and killed; religion was banned." },
      { key:"ethnicity", note:"Cham Muslims and ethnic Vietnamese were targeted for elimination." }
    ],
    "Benito Mussolini":[
      { key:"dissenter", note:"Opposition parties were banned and critics jailed or exiled." },
      { key:"religion_minority", note:"The 1938 Racial Laws stripped Italian Jews of citizenship and work." },
      { key:"ethnicity", note:"Jews and colonized peoples were racially classified and excluded." },
      { key:"labor", note:"Independent unions were dissolved into state-controlled syndicates." }
    ],
    "Augusto Pinochet":[
      { key:"dissenter", note:"Leftists and suspected sympathizers were disappeared, tortured, and killed." },
      { key:"labor", note:"Union leaders were among the very first targets." },
      { key:"intelligentsia", note:"Artists and academics were exiled or murdered — the singer Víctor Jara among them." }
    ],
    "The Kim regime (North Korea)":[
      { key:"dissenter", note:"Any disloyalty can imprison three generations of your family." },
      { key:"religion_devout", note:"Practicing Christianity can land you in a prison camp." },
      { key:"religion_minority", note:"Unsanctioned faith is treated as a threat to the state." },
      { key:"wealth", note:"Songbun permanently penalizes the descendants of former landlords and merchants." },
      { key:"business", note:"Independent commerce is criminalized and its practitioners disfavored for life." }
    ],
    "The Taliban":[
      { key:"gender", note:"Women are barred from school past sixth grade, most work, and travel without a male guardian." },
      { key:"lgbtq", note:"Homosexuality is punishable by death." },
      { key:"religion_minority", note:"Shia Hazaras and other minorities face persecution and massacre." },
      { key:"nonreligious", note:"Leaving Islam (apostasy) can carry the death penalty." },
      { key:"intelligentsia", note:"Journalists and educators are silenced, jailed, or killed." }
    ],
    "Iran's Guardian Council":[
      { key:"gender", note:"Mandatory hijab is enforced by morality police; Mahsa Amini died in their custody in 2022." },
      { key:"religion_minority", note:"Baha'is are barred from universities and jobs; some faiths are simply outlawed." },
      { key:"nonreligious", note:"Converting away from Islam can carry the death penalty." },
      { key:"lgbtq", note:"Same-sex relations carry the death penalty." },
      { key:"dissenter", note:"Protesters are imprisoned, blinded, or executed." }
    ],
    "The Ku Klux Klan":[
      { key:"ethnicity", note:"Black Americans were terrorized, disenfranchised, and lynched." },
      { key:"religion_minority", note:"Catholics and Jews were prime targets of the 1920s Klan." },
      { key:"immigrant", note:"Immigrants were cast as a threat to 'real' America." }
    ],
    "The Red Guards":[
      { key:"intelligentsia", note:"Teachers and scholars were the primary victims of the struggle sessions." },
      { key:"wealth", note:"A landlord or merchant grandparent branded you a 'bad element' for life." },
      { key:"business", note:"Any commercial family background was grounds for denunciation." },
      { key:"cultural_minority", note:"Ethnic and religious heritage was smashed as one of the 'Four Olds.'" },
      { key:"dissenter", note:"A careless word got you denounced by your own neighbors and family." }
    ],
    "A generic populist strongman":[
      { key:"dissenter", note:"Critics and protesters are the first to be delegitimized, then silenced." },
      { key:"intelligentsia", note:"Independent journalists become 'enemies of the people.'" },
      { key:"immigrant", note:"An out-group — usually immigrants or a minority — is made the scapegoat that binds the base." }
    ]
  };

  var NIEMOLLER = {
    text:"First they came for the socialists, and I did not speak out — because I was not a socialist. Then they came for the trade unionists… Then they came for me — and there was no one left to speak for me.",
    author:"Martin Niemöller", source:"post-war confession, c. 1946",
    url:"https://encyclopedia.ushmm.org/content/en/article/martin-niemoeller-first-they-came-for-the-socialists"
  };

  /* ---- Question bank (see prior comments for field meanings) ---- */
  /* Questions carry an optional `story` (a concrete vignette shown above the prompt) and, for
     consistency sets, a `set` id + `setTag`. Items in a set are phrased in the SAME direction, so a
     principled person answers them alike; the spread between answers is the hypocrisy score. */
  var QUESTIONS = [
    /* ===== Coercive moralism ===== */
    { id:"cm1", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"A community should be able to ban strip clubs and adult stores if most residents find them degrading.",
      reveal:"Zoning away 'degeneracy' is morality enforced by law — the same power a different majority uses to zone out a mosque, a gay bar, or a tattoo parlor." },
    { id:"cm2", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Recreational drugs like marijuana should stay illegal because getting high is morally wrong.",
      reveal:"'It's wrong, so ban it' is the same logic that comes for your wine, your edibles, or your caffeine the moment a different majority disapproves." },
    { id:"cm3", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Advertising for fast food and sugary drinks should be banned to protect people from themselves.",
      reveal:"Banning things 'for your own good' is the nanny state — and the hand that swats the soda can reach your raw milk, your supplements, your vape." },
    { id:"cm4", axis:"coercive_moralism", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"The law should actively promote good moral character, not just stop people from harming one another.",
      reveal:"This is the fork every free society faces: preventing harm keeps you free; enforcing 'good character' is the seed of every morality police in history." },
    { id:"cm5", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Public school events should be allowed to open with a Christian prayer.",
      reveal:"The power to put a prayer on the loudspeaker is the power to choose the god — and you won't always be the one choosing." },
    { id:"cm6", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Companies should be legally required to run diversity and inclusion training for their staff.",
      reveal:"Compelling a business to teach your values is still compelled speech — the next administration keeps the power and rewrites the lesson." },
    { id:"cm7", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Prostitution between consenting adults should remain a crime.",
      reveal:"You've put the state in charge of what two adults may do with their own bodies — a precedent that never stays in one lane." },
    { id:"cm8", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Gambling should be banned because it preys on people's weaknesses.",
      reveal:"Protecting people from their own choices is the standing excuse of every paternalist — and it scales to anything you enjoy." },
    { id:"cm9", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Movies, games, or music that carry dangerous messages should be restricted or banned.",
      reveal:"'Dangerous message' is defined by whoever holds power — today the thing you hate, tomorrow your own scripture or your own protest anthem." },
    { id:"cm10", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"There should be legal standards of public decency governing how people dress and behave.",
      reveal:"Decency laws are morality in a uniform — the same tool that fines a bikini can fine a yarmulke or a pride flag." },
    { id:"cm11", axis:"coercive_moralism", type:"quote", weight:2, reverse:false, bait:"both",
      quote:"From each according to his ability, to each according to his needs.",
      author:"Karl Marx", source:"Critique of the Gotha Programme (1875)",
      prompt:"Do you support a society that guarantees everyone's basic needs, paid for by those most able to afford it?",
      reveal:"That's Karl Marx (1875). Agree or not, notice it assumes society — not you — has first claim on what your effort produces." },
    { id:"cm12", axis:"coercive_moralism", type:"quote", weight:3, reverse:false, bait:"both",
      quote:"All within the state, nothing outside the state, nothing against the state.",
      author:"Benito Mussolini", source:"Address to the Chamber of Deputies (1928)",
      prompt:"Do you agree that private interests should always give way to the good of the nation as a whole?",
      reveal:"That is Mussolini's own definition of fascism — the nation swallowing every private life, word for word." },

    /* ===== Epistemic closure ===== */
    { id:"ec1", axis:"epistemic_closure", type:"principle", weight:3, reverse:false, bait:"left",
      prompt:"I support giving the government the power to pursue legal action against people who spread hateful messages on social media.",
      reveal:"You just handed the state the pen that defines 'hateful.' Whoever holds office next writes the definition — and it may not spare your side." },
    { id:"ec2", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Public school libraries should remove books that parents consider sexually explicit.",
      reveal:"The complaint that pulls one book pulls the opposite book in the next county — the Bible, Beloved, and Gender Queer all lose by the same rule." },
    { id:"pv_a", axis:"epistemic_closure", type:"principle", weight:3, reverse:false, bait:"left", set:"polispeech", setTag:"cheering a conservative's killing",
      story:"At a rally, a man with a megaphone shouts that a conservative activist who was recently shot dead 'had it coming' and 'deserved the bullet.'",
      prompt:"He should be arrested and charged for what he said.",
      reveal:"Vile as it is, it's speech, not a crime. Reach for handcuffs here and you've built the machine — the only question left is who aims it." },
    { id:"pv_b", axis:"epistemic_closure", type:"principle", weight:3, reverse:false, bait:"right", set:"polispeech", setTag:"cheering Floyd's death",
      story:"A woman posts online that George Floyd 'got exactly what he deserved' and that his death was 'no loss to anyone.'",
      prompt:"She should be arrested and charged for what she said.",
      reveal:"Just as ugly, just as legal. If you'd jail her but not the man at the rally — or the reverse — you don't oppose hate speech, you oppose the other team's." },
    { id:"ec3", axis:"epistemic_closure", type:"quote", weight:3, reverse:false, bait:"both",
      quote:"The great masses of the people will more easily fall victim to a big lie than to a small one.",
      author:"Adolf Hitler", source:"Mein Kampf, Vol. 1, Ch. 10 (1925)",
      prompt:"Do you think a bold, simple message repeated over and over persuades the public better than complicated facts?",
      reveal:"Sounds like marketing wisdom. It's Hitler, in Mein Kampf, laying out the propaganda method he intended to use." },
    { id:"ec4", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Social media companies should be legally required to remove posts the government identifies as false.",
      reveal:"You've made the government the referee of true and false — a whistle that, in other hands, blows on you." },
    { id:"ec5", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Universities should be able to cancel speakers whose views the campus considers harmful.",
      reveal:"'Harmful' is a moving target set by whoever runs the room — today it silences them, next year it silences you." },
    { id:"ec6", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Teachers should be legally barred from discussing gender or sexual orientation with students.",
      reveal:"A law that scrubs one topic from the classroom is a law that can scrub any topic — including the ones you want taught." },
    { id:"ec7", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"A reporter who publishes leaked classified documents should be prosecuted.",
      reveal:"Every government files its embarrassments under 'classified.' Jailing the messenger is how power keeps its secrets from you." },
    { id:"ec8", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"The government should be able to block foreign apps and websites it considers a national threat.",
      reveal:"A state that curates which windows on the world you may open eventually paints the glass." },
    { id:"ec9", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"People who spread dangerous conspiracy theories should face fines or jail.",
      reveal:"You just agreed the state may decide which unpopular beliefs are punishable. The mechanism, not the belief, is the danger." },
    { id:"ec10", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Employers should fire employees who express bigoted opinions on their own time.",
      reveal:"Make private opinion a firing offense and you've made your boss the thought police — who won't always share your definition of bigoted." },

    /* ===== Autonomy denial (abortion set is reverse-scored: 'she should be free' = pro-autonomy) ===== */
    { id:"ab_a", axis:"autonomy_denial", type:"principle", weight:3, reverse:true, bait:"right", set:"abortion", setTag:"the student who slipped up",
      story:"Susie is a college sophomore. A condom breaks, she gets pregnant, and she decides to finish her degree before starting a family — so she has an abortion early on.",
      prompt:"Susie should be free to make this choice.",
      reveal:"If you'd deny her here, compare it to how you answered the other Susies — that reveals whether your rule is about life, or about whether you approve of the woman." },
    { id:"ab_b", axis:"autonomy_denial", type:"principle", weight:3, reverse:true, bait:"left", set:"abortion", setTag:"the casual repeat",
      story:"Susie parties most weekends, rarely bothers with protection, and has had several abortions, which she treats as her normal backup plan.",
      prompt:"Susie should be free to make this choice.",
      reveal:"Less sympathetic — but it's the same procedure and the same body. If your answer changed from the student, you're judging her character, not defending a principle." },
    { id:"ab_c", axis:"autonomy_denial", type:"principle", weight:2, reverse:true, bait:"right", set:"abortion", setTag:"after rape",
      story:"Susie is raped and becomes pregnant. She chooses to end the pregnancy.",
      prompt:"Susie should be free to make this choice.",
      reveal:"If a 'life begins at conception' rule bends for rape, the rule was never really about the life — it was about whether she 'deserved' it." },
    { id:"ab_d", axis:"autonomy_denial", type:"principle", weight:2, reverse:true, bait:"left", set:"abortion", setTag:"at eight months",
      story:"Susie is eight months pregnant with a healthy baby and, for personal reasons, decides she wants a late-term abortion.",
      prompt:"Susie should be free to make this choice.",
      reveal:"If this one gives you pause after you said yes to the others, notice: you do believe there's a line. The whole debate is just where it goes — not whether." },
    { id:"ad1", axis:"autonomy_denial", type:"principle", weight:3, reverse:false, bait:"left",
      prompt:"During a deadly pandemic, the government should be able to require everyone to get an approved vaccine.",
      reveal:"A shot you trust or one you don't — either way you've conceded the body belongs to the state whenever it declares the stakes high enough." },
    { id:"ad2", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Adults should not be legally permitted to change the sex listed on their official documents.",
      reveal:"That's the government overruling an adult about their own identity — the same reach you'd resent aimed at your marriage, your name, your faith." },
    { id:"ad3", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Terminally ill adults should not be allowed to choose a doctor-assisted death.",
      reveal:"If your body is truly yours, the final door is yours. Bar it and you've handed the state the last decision you'll ever make." },
    { id:"ad4", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"The government should be able to force a person with serious mental illness into treatment against their will.",
      reveal:"'For their own good' is how involuntary confinement has always been sold — and 'ill' is a label the powerful have stretched to fit dissidents." },
    { id:"ad5", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Restaurants should be banned from serving foods the government considers too unhealthy.",
      reveal:"Once the state plans your plate for your health, it has a claim on every choice that touches your health — which is all of them." },
    { id:"ad6", axis:"autonomy_denial", type:"principle", weight:2, reverse:true, bait:"both",
      prompt:"What adults do with their own bodies is fundamentally their business, not the government's.",
      reveal:"This is the pure autonomy position. If you agreed here but also handed the state the body above, you're applying two rules and picking by tribe." },
    { id:"ad7", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"A woman seeking an abortion should be legally required to view an ultrasound and wait three days first.",
      reveal:"Mandatory delay and imagery aren't medicine — they're the state applying pressure to a private decision it couldn't ban outright." },
    { id:"ad8", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"The government should be able to set a legal limit on how many children a family may have.",
      reveal:"That's China's one-child policy — the state metering the most personal choice there is. You've conceded it may hold the meter." },

    /* ===== Out-group punishment (dilution set) ===== */
    { id:"dl_a", axis:"outgroup_punishment", type:"quote", weight:3, reverse:false, bait:"right", set:"dilution", setTag:"immigrants dilute us",
      quote:"They're poisoning the blood of our country.",
      author:"Donald Trump", source:"Campaign remarks, December 2023 (recorded)",
      prompt:"Do you think that welcoming large numbers of people from very different nationalities and religions dilutes a country's national identity?",
      reveal:"You just agreed with Donald Trump (2023) — and with the 'blood poisoning' passage in Hitler's Mein Kampf. Now compare it to the town on the other question." },
    { id:"dl_b", axis:"outgroup_punishment", type:"principle", weight:3, reverse:false, bait:"left", set:"dilution", setTag:"conservatives moving in",
      story:"A distinctive small town starts filling up with wealthy conservative transplants who reshape its culture, its businesses, and its politics.",
      prompt:"Longtime locals are right to resent this change and push back against it.",
      reveal:"Same instinct: 'outsiders are ruining our home.' If you cheered one of these but not the other, your worry was never 'identity' — it was which outsiders." },
    { id:"op1", axis:"outgroup_punishment", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"A democratic majority should be able to vote to take rights away from a group it sees as a threat.",
      reveal:"Rights a 51% vote can revoke aren't rights — and next election you may be the 49%." },
    { id:"op2", axis:"outgroup_punishment", type:"quote", weight:3, reverse:false, bait:"left",
      quote:"Hatred as an element of struggle; unbending hatred for the enemy, that transforms us into effective, violent, selective, cold killing machines.",
      author:"Che Guevara", source:"Message to the Tricontinental (1967)",
      prompt:"Do you think a truly just cause sometimes needs genuine hatred of its enemies to win?",
      reveal:"That's Che Guevara (1967) — a hero on a million T-shirts — prescribing hatred as a tool and calling it virtue." },
    { id:"op3", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"People from certain countries should be barred from entering, regardless of their individual circumstances.",
      reveal:"Judging a person by their passport instead of their conduct is the oldest engine of persecution there is." },
    { id:"op4", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"It's fair to hold members of a historically privileged group responsible for the sins of that group.",
      reveal:"Inherited collective guilt is the same machine whether the class is defined by race, religion, or bloodline. You just endorsed the machine." },
    { id:"op5", axis:"outgroup_punishment", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"During a terrorism emergency, the government should be able to detain members of the suspected community without charge.",
      reveal:"That's the exact case made for Japanese-American internment — a policy the country now near-universally regrets." },
    { id:"op6", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Citizens who don't share the country's majority religion tend to be less loyal.",
      reveal:"Second-class citizenship by faith is the doorstep of every religious persecution in the book." },
    { id:"op7", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Some views are so tied to privilege that the people who hold them shouldn't be given a platform.",
      reveal:"Deciding who may speak based on who they are is a power that always, eventually, turns to point the other way." },
    { id:"op8", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"A group that rejects the nation's core values should lose some of its legal protections.",
      reveal:"'Rejects our values' has justified the cage for dissidents, minorities, and reformers alike — and it won't always be you deciding." },
    { id:"op9", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Full citizenship rights should depend on demonstrated loyalty to the country.",
      reveal:"Rights contingent on loyalty are a leash, not rights — and the state decides when you've tugged it." },
    { id:"op10", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"People of a privileged race should defer to others on political issues that don't personally affect them.",
      reveal:"Ranking whose political voice counts by their race is the same sorting you'd call bigotry pointed the other way." },

    /* ===== Retributive impulse (due-process set) ===== */
    { id:"dp_a", axis:"retributive_impulse", type:"principle", weight:3, reverse:false, bait:"left", set:"dueprocess", setTag:"the accused executive",
      story:"A powerful executive is accused by several women of sexual assault. No trial has happened yet.",
      prompt:"He should lose his job and reputation now, before any court rules.",
      reveal:"Maybe he's guilty. But 'punish first, prove later' is a machine — and whether you'll defend it depends entirely on who's in the chair next time." },
    { id:"dp_b", axis:"retributive_impulse", type:"principle", weight:3, reverse:false, bait:"right", set:"dueprocess", setTag:"the accused immigrant",
      story:"An undocumented immigrant is accused of a violent crime. No trial has happened yet.",
      prompt:"He should be jailed or deported now, before any court rules.",
      reveal:"Same move: skip the trial, punish on the accusation. Demand due process for one of these men but not the other, and you don't believe in due process — you believe in your side." },
    { id:"ri1", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"The point of prison is to make offenders pay for what they did, even if it makes no one safer.",
      reveal:"That's punishment for its own sake. A system that stops asking 'does this help?' will do anything and call it justice." },
    { id:"ri2", axis:"retributive_impulse", type:"quote", weight:3, reverse:false, bait:"left",
      quote:"Terror is nothing other than justice, prompt, severe, inflexible.",
      author:"Maximilien Robespierre", source:"Speech on Political Morality, Feb 5, 1794",
      prompt:"In a genuine crisis, is swift and severe punishment of the nation's enemies simply justice?",
      reveal:"That's Robespierre defending the Reign of Terror — months before the same blade took his own head." },
    { id:"ri3", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Someone who tweeted something offensive ten years ago deserves to be fired today.",
      reveal:"No appeal, no expiry, no proportion — that's not justice, it's a blacklist, and it's always one search away from including you." },
    { id:"ri4", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Repeat petty thieves should get long mandatory prison sentences to send a message.",
      reveal:"Punishment as 'a message' uses a person as a billboard — and the fixed sentence never fits the actual human in the dock." },
    { id:"ri5", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Publicly shaming and humiliating wrongdoers online is a healthy form of justice.",
      reveal:"The village stocks and the struggle session are the same instrument; only the politics of the crowd change." },
    { id:"ri6", axis:"retributive_impulse", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"Torture is acceptable against a terrorist we're confident is holding back information.",
      reveal:"'We're confident' is the exact certainty every torturer in history has claimed — and been wrong about, on the innocent." },
    { id:"ri7", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"A justice system that emphasizes forgiveness and rehabilitation is dangerously soft.",
      reveal:"A system that sneers at mercy has cut its own brakes — and brakes are what protect the innocent when the accusation is wrong." },
    { id:"ri8", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"It's better that some innocent people are punished than that a guilty person goes free.",
      reveal:"That inverts the founding rule of justice — and it is the precise arithmetic of every witch hunt, purge, and show trial." },
    { id:"ri9", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"A business should be boycotted into bankruptcy over its owner's political donations.",
      reveal:"Economic ruin for lawful private views is a weapon — and the boycott machine works just as well aimed back at you." },
    { id:"ri10", axis:"retributive_impulse", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"The death penalty is worth keeping even though we know some innocent people will be executed.",
      reveal:"You've accepted killing the innocent as an acceptable price — the state claiming ultimate power over life with a known error rate." },

    /* ===== Personalist deference ===== */
    { id:"pd1", axis:"personalist_deference", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"In a real national emergency, the president should be able to act fast without waiting for Congress or the courts.",
      reveal:"Every strongman first arrived as the answer to a crisis. Suspending the rules 'just this once' is exactly how the rules stop mattering." },
    { id:"pd2", axis:"personalist_deference", type:"quote", weight:3, reverse:false, bait:"right",
      quote:"I alone can fix it.",
      author:"Donald Trump", source:"Republican National Convention, July 21, 2016",
      prompt:"Do you think the country is so broken that it needs one strong leader who can personally fix it?",
      reveal:"That's Donald Trump (2016). 'I alone' is the defining grammar of personalist rule — the man placed above the institutions." },
    { id:"pd3", axis:"personalist_deference", type:"quote", weight:3, reverse:false, bait:"left",
      quote:"Political power grows out of the barrel of a gun.",
      author:"Mao Zedong", source:"Speech, November 6, 1938",
      prompt:"Do you think that, in the end, real political change only comes through force?",
      reveal:"That's Mao Zedong (1938). It's the creed that justified every purge that followed — power as force, not consent." },
    { id:"pd4", axis:"personalist_deference", type:"quote", weight:2, reverse:false, bait:"right",
      quote:"I could stand in the middle of Fifth Avenue and shoot somebody and I wouldn't lose any voters.",
      author:"Donald Trump", source:"Campaign rally, Sioux Center, Iowa, January 23, 2016",
      prompt:"Do you admire a leader whose supporters stick with him no matter what he does?",
      reveal:"That's Donald Trump (2016), describing loyalty that would survive murder. Unconditional loyalty to a person is the raw material of a cult, not a republic." },
    { id:"pd5", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"A leader who actually delivers results shouldn't be held back by 'norms' and 'procedures.'",
      reveal:"Norms and procedures are the only things standing between you and whatever the next leader decides to do." },
    { id:"pd6", axis:"personalist_deference", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"A president should be able to ignore a court ruling he's convinced is wrong.",
      reveal:"A leader who picks which laws bind him is no longer under the law — he is the law." },
    { id:"pd7", axis:"personalist_deference", type:"principle", weight:3, reverse:false, bait:"left",
      prompt:"When our cause is clearly right, we should use every tool of power we can and not worry about restraint.",
      reveal:"'The ends justify the means' is the sentence that precedes every atrocity — including the ones committed in your name." },
    { id:"pd8", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Term limits and checks on power mostly just get in the way of a good leader.",
      reveal:"Every check you strip for the leader you love stays stripped for the one you fear." },
    { id:"pd9", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Loudly criticizing the government during a war or crisis is basically disloyal.",
      reveal:"Equating dissent with treason is the first move of every strongman — and the last free thing you'll get to say." },
    { id:"pd10", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"A strong, decisive leader matters more than strong institutions.",
      reveal:"Leaders die, defect, and turn. Institutions are what protect you on the day the leader is no longer on your side." },
    { id:"pd11", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"It's fine to use emergency powers to push through good policies that couldn't pass the normal way.",
      reveal:"An 'emergency' that routes around the vote is exactly how temporary power quietly becomes permanent." },
    { id:"pd12", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Big historical progress comes from great leaders, so we should trust them over rigid rules.",
      reveal:"The great-man theory is the mission statement of every dictatorship. Rules outlast men for a reason." }
  ];

  /* Consistency sets — the same underlying principle tested against different targets/sympathies.
     The spread between a taker's answers within a set is the hypocrisy score. */
  var SETS = {
    abortion:{ label:"Abortion: is it about her body — or about whether you approve of her?" },
    polispeech:{ label:"Celebrating a political killing: a speech crime, or only when the victim is your side's?" },
    dilution:{ label:"'Outsiders are changing our home': a principle, or just about which outsiders?" },
    dueprocess:{ label:"Punish first, try later: for anyone — or only the accused you already dislike?" }
  };

  /* ---- Alignment roster ----
     fingerprint order matches AXES: [moralism, censorship, autonomy, outgroup, retribution, strongman], each 0..1.
     dossier.highs = the axis keys that define this figure's pattern.
     dossier.policies = specific, dated historical policies, each tagged with the axis it embodies.
     dossier.sources = links to the historical record (verified museum/archive URLs where possible).
     positive:true entries are the low-authoritarian matches; their "policies" are a record of RESISTING coercion. */
  var ALIGNMENTS = [
    { name:"Adolf Hitler", lean:"Fascist right", fp:[0.85,0.95,0.90,1.00,0.95,1.00],
      blurb:"Total censorship, a purged out-group, and a leader above all law. If this is your nearest match, the mechanisms you endorsed are the mechanisms of the Holocaust.",
      dossier:{
        highs:["outgroup_punishment","personalist_deference","epistemic_closure","autonomy_denial"],
        policies:[
          { axis:"outgroup_punishment", title:"The Nuremberg Laws (1935)", detail:"Stripped German Jews of citizenship and criminalized marriage and sex between Jews and 'Aryans' — an out-group defined into legal non-persons. This was the legal groundwork for the Holocaust." },
          { axis:"personalist_deference", title:"The Enabling Act (1933)", detail:"Let Hitler enact laws without the Reichstag or the president. 'A strong leader who acts without the legislature in a crisis' — written into law, permanently." },
          { axis:"epistemic_closure", title:"Book burnings & the Propaganda Ministry (1933)", detail:"Students burned 'un-German' books while Goebbels's ministry seized control of every newspaper, film, and radio broadcast. 'Some ideas are too dangerous to hear' became state policy." },
          { axis:"autonomy_denial", title:"Aktion T4 (1939)", detail:"The forced 'euthanasia' of roughly 250,000 disabled people — the state deciding whose body and life had value, and killing accordingly." }
        ],
        sources:[
          { label:"USHMM — The Nuremberg Race Laws", url:"https://encyclopedia.ushmm.org/content/en/article/the-nuremberg-race-laws" },
          { label:"USHMM — Nazi 'euthanasia' (T4) program", url:"https://encyclopedia.ushmm.org/content/en/article/euthanasia-program" },
          { label:"USHMM — Book burning (May 1933)", url:"https://encyclopedia.ushmm.org/content/en/article/book-burning" },
          { label:"Reich Citizenship Law — primary text", url:"https://germanhistorydocs.org/en/nazi-germany-1933-1945/the-reich-citizenship-law-september-15-1935-and-the-first-regulation-to-the-reich-citizenship-law-november-14-1935" }
        ]
      } },

    { name:"Joseph Stalin", lean:"Authoritarian left", fp:[0.90,1.00,0.90,0.90,1.00,1.00],
      blurb:"Show trials, engineered famine, and a cult of personality. Proof the far left arrives at the same machinery — the enemy class simply replaces the enemy race.",
      dossier:{
        highs:["epistemic_closure","personalist_deference","retributive_impulse","outgroup_punishment"],
        policies:[
          { axis:"retributive_impulse", title:"The Great Purge (1936–38)", detail:"Show trials and roughly 750,000 executions of 'enemies of the people' — punishment as spectacle, guilt presumed, confession extracted." },
          { axis:"outgroup_punishment", title:"The Holodomor (1932–33)", detail:"A man-made famine that killed millions of Ukrainians, engineered through forced grain seizures aimed at a group defined as class enemies." },
          { axis:"retributive_impulse", title:"The Gulag", detail:"A continent-spanning system of forced-labor camps for political prisoners — dissent redefined as crime." },
          { axis:"epistemic_closure", title:"Censorship & the cult of personality", detail:"Total press control, rewritten history, doctored photographs. The state owned reality itself." }
        ],
        sources:[
          { label:"Wikipedia — Great Purge", url:"https://en.wikipedia.org/wiki/Great_Purge" },
          { label:"Wikipedia — Holodomor", url:"https://en.wikipedia.org/wiki/Holodomor" },
          { label:"Wikipedia — Gulag", url:"https://en.wikipedia.org/wiki/Gulag" }
        ]
      } },

    { name:"Mao Zedong", lean:"Authoritarian left", fp:[0.90,1.00,0.85,0.85,0.90,0.95],
      blurb:"Thought reform, denunciation, and tens of millions dead in the name of the people. Coercion 'for the collective good' is still coercion.",
      dossier:{
        highs:["epistemic_closure","personalist_deference","outgroup_punishment","retributive_impulse"],
        policies:[
          { axis:"autonomy_denial", title:"The Great Leap Forward (1958–62)", detail:"Forced collectivization produced history's deadliest famine — an estimated 15–45 million dead — because no one could tell the leader the plan was failing." },
          { axis:"epistemic_closure", title:"The Cultural Revolution (1966–76)", detail:"Struggle sessions, denunciations, and the persecution of anyone 'impure' in thought. Neighbors and children were turned into informants." },
          { axis:"retributive_impulse", title:"The Anti-Rightist Campaign (1957)", detail:"Citizens were invited to voice criticism, then hundreds of thousands were purged for doing so — a trap for dissent." }
        ],
        sources:[
          { label:"Wikipedia — Great Leap Forward", url:"https://en.wikipedia.org/wiki/Great_Leap_Forward" },
          { label:"Wikipedia — Cultural Revolution", url:"https://en.wikipedia.org/wiki/Cultural_Revolution" }
        ]
      } },

    { name:"Pol Pot", lean:"Authoritarian left", fp:[0.95,0.90,0.95,1.00,1.00,0.90],
      blurb:"Emptied cities and executed the educated to build a purer society. The end point of treating an out-group as a stain to be removed.",
      dossier:{
        highs:["outgroup_punishment","autonomy_denial","retributive_impulse","coercive_moralism"],
        policies:[
          { axis:"outgroup_punishment", title:"Year Zero & the Killing Fields (1975–79)", detail:"The Khmer Rouge executed intellectuals, minorities, and 'class enemies' — wearing glasses could be a death sentence. Roughly 1.5–2 million died, a quarter of Cambodia." },
          { axis:"autonomy_denial", title:"Forced evacuation of the cities", detail:"Phnom Penh was emptied at gunpoint in days; the population was marched to labor camps. The state owned where you lived, worked, and slept." },
          { axis:"coercive_moralism", title:"Abolition of money, religion, and family", detail:"Private life itself was outlawed to engineer a 'pure' agrarian society." }
        ],
        sources:[
          { label:"Wikipedia — Khmer Rouge", url:"https://en.wikipedia.org/wiki/Khmer_Rouge" },
          { label:"Wikipedia — Cambodian genocide", url:"https://en.wikipedia.org/wiki/Cambodian_genocide" }
        ]
      } },

    { name:"Benito Mussolini", lean:"Fascist right", fp:[0.85,0.90,0.80,0.85,0.85,1.00],
      blurb:"Coined the merger of leader, state, and party. The original template every later strongman copied.",
      dossier:{
        highs:["personalist_deference","epistemic_closure","outgroup_punishment","coercive_moralism"],
        policies:[
          { axis:"personalist_deference", title:"The Acerbo Law & March on Rome (1922–23)", detail:"Rigged the electoral law to hand his party an automatic majority, after marching on the capital to seize power by threat." },
          { axis:"epistemic_closure", title:"OVRA secret police & press censorship", detail:"Banned opposition parties, jailed critics, and placed every newspaper under state control." },
          { axis:"outgroup_punishment", title:"The Italian Racial Laws (1938)", detail:"Stripped Italian Jews of civil rights, barred them from schools and professions, copying the Nuremberg model." }
        ],
        sources:[
          { label:"Wikipedia — Benito Mussolini", url:"https://en.wikipedia.org/wiki/Benito_Mussolini" },
          { label:"Wikipedia — Italian racial laws", url:"https://en.wikipedia.org/wiki/Italian_racial_laws" }
        ]
      } },

    { name:"Augusto Pinochet", lean:"Military right", fp:[0.70,0.85,0.75,0.90,1.00,0.95],
      blurb:"Disappeared dissidents and tortured to hold power. What 'a strong leader who bypasses the courts' looks like once the courts are gone.",
      dossier:{
        highs:["retributive_impulse","personalist_deference","outgroup_punishment","epistemic_closure"],
        policies:[
          { axis:"personalist_deference", title:"The 1973 coup & Caravan of Death", detail:"Overthrew an elected government, then a military squad toured the country executing political prisoners without trial." },
          { axis:"retributive_impulse", title:"DINA secret police & Villa Grimaldi", detail:"The regime disappeared and tortured tens of thousands; roughly 3,000 were killed for their politics." },
          { axis:"epistemic_closure", title:"Book burnings & banned parties", detail:"Political parties were outlawed and books publicly burned to erase the opposition's ideas." }
        ],
        sources:[
          { label:"Wikipedia — Augusto Pinochet", url:"https://en.wikipedia.org/wiki/Augusto_Pinochet" },
          { label:"Wikipedia — Caravan of Death", url:"https://en.wikipedia.org/wiki/Caravan_of_Death" }
        ]
      } },

    { name:"The Kim regime (North Korea)", lean:"Personalist cult", fp:[0.85,1.00,0.90,0.85,0.90,1.00],
      blurb:"Total information control and worship of one bloodline. The purest living specimen of personalist rule.",
      dossier:{
        highs:["epistemic_closure","personalist_deference","autonomy_denial","outgroup_punishment"],
        policies:[
          { axis:"outgroup_punishment", title:"The songbun caste system", detail:"Every citizen is ranked by ancestral loyalty; a 'hostile' classification limits food, housing, work, and marriage for life." },
          { axis:"retributive_impulse", title:"Kwalliso prison camps", detail:"Three generations of a family can be imprisoned for one member's political 'crime' — guilt by bloodline." },
          { axis:"epistemic_closure", title:"Total information control", detail:"No free press, no open internet, and a state-mandated cult around the Kim family from birth." }
        ],
        sources:[
          { label:"Wikipedia — Human rights in North Korea", url:"https://en.wikipedia.org/wiki/Human_rights_in_North_Korea" },
          { label:"Wikipedia — Songbun", url:"https://en.wikipedia.org/wiki/Songbun" }
        ]
      } },

    { name:"The Taliban", lean:"Theocratic", fp:[1.00,0.90,1.00,0.95,0.90,0.70],
      blurb:"State enforcement of one moral code over every private life. Religious bigotry with the full power of government behind it.",
      dossier:{
        highs:["coercive_moralism","autonomy_denial","outgroup_punishment","epistemic_closure"],
        policies:[
          { axis:"coercive_moralism", title:"Ministry for the Promotion of Virtue & Prevention of Vice", detail:"A morality police that enforces dress, grooming, prayer, and behavior by law — 'legislating decency' made total." },
          { axis:"autonomy_denial", title:"Bans on girls' education & women in public life", detail:"Women barred from secondary school, most work, and travel without a male guardian. The state owns half the population's choices." },
          { axis:"retributive_impulse", title:"Public executions, floggings & amputations", detail:"Punishment as public spectacle, without recognizable due process." }
        ],
        sources:[
          { label:"Wikipedia — Taliban treatment of women", url:"https://en.wikipedia.org/wiki/Taliban_treatment_of_women" },
          { label:"Wikipedia — Ministry (Promotion of Virtue…)", url:"https://en.wikipedia.org/wiki/Ministry_for_the_Propagation_of_Virtue_and_the_Prevention_of_Vice_(Afghanistan)" }
        ]
      } },

    { name:"Iran's Guardian Council", lean:"Theocratic", fp:[1.00,0.90,0.95,0.85,0.85,0.75],
      blurb:"Morality police and clerical veto over law and body. The mechanism you endorsed as 'enforcing decency,' fully built out.",
      dossier:{
        highs:["coercive_moralism","autonomy_denial","epistemic_closure","outgroup_punishment"],
        policies:[
          { axis:"coercive_moralism", title:"The morality police & mandatory hijab", detail:"The Gasht-e Ershad enforces a dress code by law; in 2022, Mahsa Amini died in their custody, igniting nationwide protests." },
          { axis:"personalist_deference", title:"Candidate vetting", detail:"The unelected Council disqualifies reformist candidates before elections, hollowing the vote while keeping its form." },
          { axis:"epistemic_closure", title:"Press & internet censorship", detail:"Newspapers are shuttered and the internet throttled or cut during unrest." }
        ],
        sources:[
          { label:"Wikipedia — Guardian Council", url:"https://en.wikipedia.org/wiki/Guardian_Council" },
          { label:"Wikipedia — Death of Mahsa Amini", url:"https://en.wikipedia.org/wiki/Death_of_Mahsa_Amini" }
        ]
      } },

    { name:"The Ku Klux Klan", lean:"Hate movement (right)", fp:[0.80,0.70,0.75,1.00,0.95,0.50],
      blurb:"Terror in service of an in-group's supremacy. If this is your match, your out-group answers are doing the heavy lifting.",
      dossier:{
        highs:["outgroup_punishment","retributive_impulse","coercive_moralism"],
        policies:[
          { axis:"outgroup_punishment", title:"Reconstruction-era terror (1865–71)", detail:"Organized murder and intimidation to strip newly freed Black Americans of the vote and of public life." },
          { axis:"retributive_impulse", title:"Lynching campaigns", detail:"Extrajudicial killings staged as public warnings — punishment without law, aimed at a whole community." },
          { axis:"coercive_moralism", title:"The 1920s revival", detail:"A mass movement of millions fusing anti-Black, anti-Catholic, anti-immigrant, and 'moral purity' crusading." }
        ],
        sources:[
          { label:"Wikipedia — Ku Klux Klan", url:"https://en.wikipedia.org/wiki/Ku_Klux_Klan" },
          { label:"Wikipedia — Lynching in the United States", url:"https://en.wikipedia.org/wiki/Lynching_in_the_United_States" }
        ]
      } },

    { name:"The Red Guards", lean:"Hate movement (left)", fp:[0.75,0.90,0.70,0.90,0.95,0.85],
      blurb:"Mobs who destroyed careers and lives in public struggle sessions over impure views. The ancestor of every 'exile the heretic' impulse.",
      dossier:{
        highs:["epistemic_closure","outgroup_punishment","retributive_impulse","personalist_deference"],
        policies:[
          { axis:"epistemic_closure", title:"Destroying the 'Four Olds' (1966)", detail:"Youth brigades burned books, smashed temples, and destroyed art declared ideologically impure." },
          { axis:"retributive_impulse", title:"Struggle sessions", detail:"Teachers, officials, and neighbors were publicly humiliated, beaten, and driven to suicide for wrong opinions or bad class background." },
          { axis:"outgroup_punishment", title:"Denunciation of family and friends", detail:"Loyalty to the movement outranked loyalty to your own parents — informing on them was celebrated." }
        ],
        sources:[
          { label:"Wikipedia — Red Guards", url:"https://en.wikipedia.org/wiki/Red_Guards" },
          { label:"Wikipedia — Cultural Revolution", url:"https://en.wikipedia.org/wiki/Cultural_Revolution" }
        ]
      } },

    { name:"A generic populist strongman", lean:"Authoritarian populist", fp:[0.60,0.60,0.50,0.70,0.60,0.85],
      blurb:"Not a monster yet — but every one of them started here, riding grievance and loyalty past the guardrails. This is the on-ramp.",
      dossier:{
        highs:["personalist_deference","outgroup_punishment"],
        policies:[
          { axis:"personalist_deference", title:"“Only I can fix it”", detail:"The leader casts himself as the sole solution and the institutions as the obstacle — the first move of every democratic breakdown." },
          { axis:"outgroup_punishment", title:"A scapegoat for the nation's problems", detail:"An out-group (immigrants, a minority, 'elites') is blamed to bind supporters together through a shared enemy." },
          { axis:"epistemic_closure", title:"The press as 'enemy of the people'", detail:"Independent media is delegitimized so the leader's account becomes the only trusted one." }
        ],
        sources:[
          { label:"Freedom House — Freedom in the World", url:"https://freedomhouse.org/report/freedom-world" },
          { label:"Wikipedia — Democratic backsliding", url:"https://en.wikipedia.org/wiki/Democratic_backsliding" }
        ]
      } },

    { name:"A proceduralist moderate", lean:"Democratic center", fp:[0.45,0.40,0.45,0.40,0.45,0.40],
      blurb:"Uneasy with coercion but not immune to it. Trusts process over strongmen — most of the time.", positive:true,
      dossier:{
        highs:[],
        policies:[
          { axis:"personalist_deference", title:"Rules over rulers", detail:"You lean toward letting the process decide rather than a strong personality — the instinct that keeps a crisis from becoming a coup." },
          { axis:"coercive_moralism", title:"But watch the exceptions", detail:"Your profile still has soft spots where you'd make an exception 'just this once.' That's the door every strongman walks through." }
        ],
        sources:[
          { label:"Library of Congress — The Federalist Papers", url:"https://guides.loc.gov/federalist-papers/full-text" },
          { label:"Wikipedia — Separation of powers", url:"https://en.wikipedia.org/wiki/Separation_of_powers" }
        ]
      } },

    { name:"An ACLU-style civil libertarian", lean:"Civil libertarian", fp:[0.15,0.10,0.10,0.15,0.20,0.15],
      blurb:"Defends the rights of people you can't stand, precisely because that's the only version of rights that protects you too.", positive:true,
      dossier:{
        highs:[],
        policies:[
          { axis:"epistemic_closure", title:"Free speech even for the hateful (Skokie, 1977)", detail:"The ACLU defended neo-Nazis' right to march — not out of sympathy, but because a government that can silence them can silence anyone." },
          { axis:"outgroup_punishment", title:"Rights are only real when universal", detail:"Your answers extend the same protections to your enemies as to your allies — the one test authoritarians always fail." }
        ],
        sources:[
          { label:"ACLU — Our history", url:"https://www.aclu.org/about/aclu-history" },
          { label:"Wikipedia — NSPA v. Village of Skokie", url:"https://en.wikipedia.org/wiki/National_Socialist_Party_of_America_v._Village_of_Skokie" }
        ]
      } },

    { name:"Václav Havel", lean:"Anti-authoritarian dissident", fp:[0.20,0.10,0.15,0.15,0.20,0.10],
      blurb:"Jailed playwright who beat a police state with truth and refused to become it in return. A rare match — you distrust coercion from every direction.", positive:true,
      dossier:{
        highs:[],
        policies:[
          { axis:"epistemic_closure", title:"“The Power of the Powerless” (1978)", detail:"Argued that living in truth — refusing the small daily lies a regime demands — is what ultimately breaks it." },
          { axis:"personalist_deference", title:"Won, then gave power back", detail:"Led the Velvet Revolution and became president, then governed under the same limits he'd fought to restore." }
        ],
        sources:[
          { label:"Wikipedia — Václav Havel", url:"https://en.wikipedia.org/wiki/V%C3%A1clav_Havel" },
          { label:"Wikipedia — The Power of the Powerless", url:"https://en.wikipedia.org/wiki/The_Power_of_the_Powerless" }
        ]
      } },

    { name:"Frederick Douglass", lean:"Rights abolitionist", fp:[0.15,0.15,0.10,0.10,0.25,0.20],
      blurb:"Measured liberty by whether it extended to the most despised person in the room. The opposite pole of everything above.", positive:true,
      dossier:{
        highs:[],
        policies:[
          { axis:"outgroup_punishment", title:"“What to the Slave Is the Fourth of July?” (1852)", detail:"Turned the nation's own founding language against its exclusions — freedom is a fraud until it reaches the least free." },
          { axis:"autonomy_denial", title:"Self-ownership as the first right", detail:"Escaped slavery and spent his life arguing that a person's ownership of themselves precedes any claim the state can make." }
        ],
        sources:[
          { label:"Wikipedia — Frederick Douglass", url:"https://en.wikipedia.org/wiki/Frederick_Douglass" },
          { label:"Wikipedia — What to the Slave Is the Fourth of July?", url:"https://en.wikipedia.org/wiki/What_to_the_Slave_Is_the_Fourth_of_July%3F" }
        ]
      } }
  ];

  return { AXES: AXES, OPTIONS: OPTIONS, QUESTIONS: QUESTIONS, ALIGNMENTS: ALIGNMENTS, SETS: SETS,
           SELF_SCALES: SELF_SCALES, ATTRIBUTES: ATTRIBUTES, TARGETS: TARGETS, NIEMOLLER: NIEMOLLER };
})();
