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
  var QUESTIONS = [
    { id:"cm1", axis:"coercive_moralism", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"If a behavior is deeply immoral, the government is justified in banning it — even between consenting adults.",
      reveal:"This is the single engine behind drug prohibition, sex-work bans, sodomy laws AND speech codes. You just handed it to whoever holds power next." },
    { id:"cm2", axis:"coercive_moralism", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"The state should be able to outlaw a medical procedure that a religious majority finds abhorrent.",
      reveal:"That is the exact logic of abortion bans — and, in other hands, of banning IVF, blood transfusions, or end-of-life care that a different majority finds abhorrent." },
    { id:"cm3", axis:"coercive_moralism", type:"principle", weight:3, reverse:false, bait:"left",
      prompt:"Speech that spreads hateful ideas should be illegal, not merely condemned.",
      reveal:"Hate-speech law hands the state a definition of 'hateful' — the same tool used elsewhere to jail flag-burners, blasphemers, and protesters." },
    { id:"cm4", axis:"coercive_moralism", type:"quote", weight:2, reverse:false, bait:"both",
      quote:"From each according to his ability, to each according to his needs.",
      author:"Karl Marx", source:"Critique of the Gotha Programme (1875)",
      prompt:"Do you agree society should take from each according to ability and give to each according to need?",
      reveal:"That was Karl Marx (1875). Agree or not, notice it presumes society, not you, has first claim on your labor and its fruits." },

    { id:"ec1", axis:"epistemic_closure", type:"principle", weight:3, reverse:false, bait:"left",
      prompt:"Platforms should remove 'misinformation,' even when it is someone's sincere political opinion.",
      reveal:"Whoever is handed the power to label speech 'misinformation' gets to erase yours the moment the other side holds the lever." },
    { id:"ec2", axis:"epistemic_closure", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"Schools should be forbidden from assigning books that clash with traditional values.",
      reveal:"Book bans don't check party registration. The same power pulls the Bible, Beloved, and Slaughterhouse-Five, depending on who runs the board that year." },
    { id:"ec3", axis:"epistemic_closure", type:"quote", weight:3, reverse:false, bait:"both",
      quote:"The great masses of the people will more easily fall victim to a big lie than to a small one.",
      author:"Adolf Hitler", source:"Mein Kampf, Vol. 1, Ch. 10 (1925)",
      prompt:"Do you agree that people are more easily fooled by a big lie than a small one?",
      reveal:"Most people nod at this. It is Hitler, in Mein Kampf, describing the propaganda method he himself intended to use." },
    { id:"ec4", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Some ideas are so dangerous the public is better off never hearing them.",
      reveal:"Every censor in history believed exactly this — and every one of them appointed themselves the judge of which ideas those were." },

    { id:"ad1", axis:"autonomy_denial", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"The government has a legitimate interest in what consenting adults do in their own bedrooms.",
      reveal:"Concede this and you've licensed the state into everyone's bedroom — including yours, on someone else's terms." },
    { id:"ad2", axis:"autonomy_denial", type:"principle", weight:3, reverse:false, bait:"left",
      prompt:"The state may require an individual to undergo a medical procedure for the collective good.",
      reveal:"Whether it's a vaccine you support or a sterilization you don't, you've conceded the body belongs to the state whenever it decides the stakes are high enough." },
    { id:"ad3", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"When society's interests are great enough, a person no longer fully owns their own body.",
      reveal:"This is the master key that unlocks every bodily-autonomy fight at once — abortion, drugs, vaccines, assisted dying. You just said the key exists." },
    { id:"ad4", axis:"autonomy_denial", type:"principle", weight:2, reverse:true, bait:"both",
      prompt:"What an adult does with their own body is fundamentally their own business, not the government's.",
      reveal:"This is the pure autonomy position. If you agreed here but also agreed above, you're holding two incompatible rules and choosing which to apply by tribe." },

    { id:"op1", axis:"outgroup_punishment", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"It is acceptable to strip rights from a group whose values threaten our way of life.",
      reveal:"'Our way of life' is defined by whoever holds power. Today the threatening group is theirs; next term it is yours." },
    { id:"op2", axis:"outgroup_punishment", type:"quote", weight:3, reverse:false, bait:"right",
      quote:"They're poisoning the blood of our country.",
      author:"Donald Trump", source:"Campaign remarks, December 2023 (recorded)",
      prompt:"Do you agree that some groups poison the character or 'blood' of a nation?",
      reveal:"You agreed with Donald Trump (2023) — echoing, nearly word for word, the 'blood poisoning' passage from Hitler's Mein Kampf." },
    { id:"op3", axis:"outgroup_punishment", type:"principle", weight:3, reverse:false, bait:"left",
      prompt:"Members of a privileged or oppressor group should carry less weight in political decisions.",
      reveal:"Collective guilt by identity is the same machine whether the disfavored class is defined by race, religion, or class. You just endorsed the machine." },

    { id:"ri1", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Some crimes deserve harsh punishment even if it does nothing to reduce crime.",
      reveal:"That's punishment for its own sake — retribution, not safety. Useful to notice when you're paying for vengeance and calling it justice." },
    { id:"ri2", axis:"retributive_impulse", type:"principle", weight:3, reverse:false, bait:"left",
      prompt:"People who voice bigoted views deserve to lose their jobs and be socially exiled.",
      reveal:"Trading due process for mob judgment feels righteous — until the mob's definition of 'bigoted' turns and comes for you." },
    { id:"ri3", axis:"retributive_impulse", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"The death penalty is justified even though we know some innocent people will be executed.",
      reveal:"You've accepted that killing innocents is an acceptable price. That is the state claiming the ultimate power over life with a known error rate." },

    { id:"pd1", axis:"personalist_deference", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"In a genuine crisis, a strong leader should be able to act without waiting on courts or legislatures.",
      reveal:"Every strongman in history first arrived as the answer to a crisis. Suspending the rules 'just this once' is how the rules stop mattering." },
    { id:"pd2", axis:"personalist_deference", type:"quote", weight:3, reverse:false, bait:"right",
      quote:"I alone can fix it.",
      author:"Donald Trump", source:"Republican National Convention, July 21, 2016",
      prompt:"Do you agree the country needs a leader strong enough to fix its problems single-handedly?",
      reveal:"That's Donald Trump (2016). 'I alone' is the defining grammar of personalist rule — the leader above the institutions." },
    { id:"pd3", axis:"personalist_deference", type:"quote", weight:3, reverse:false, bait:"left",
      quote:"Political power grows out of the barrel of a gun.",
      author:"Mao Zedong", source:"Speech, November 6, 1938",
      prompt:"Do you agree that political power ultimately rests on force?",
      reveal:"That's Mao Zedong (1938). It's the creed that justified every purge that followed — power as force, not consent." },
    { id:"pd4", axis:"personalist_deference", type:"quote", weight:2, reverse:false, bait:"right",
      quote:"I could stand in the middle of Fifth Avenue and shoot somebody and I wouldn't lose any voters.",
      author:"Donald Trump", source:"Campaign rally, Sioux Center, Iowa, January 23, 2016",
      prompt:"Do you agree a truly strong leader keeps his supporters' loyalty no matter what he does?",
      reveal:"That's Donald Trump (2016), describing loyalty that survives even murder. Unconditional loyalty to a person is the raw material of a cult, not a republic." },

    /* ============ EXTENDED POOL (long version only) ============ */

    /* --- Coercive moralism (extended) --- */
    { id:"cm5", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Public schools should lead students in prayer.",
      reveal:"The power to script your child's prayer is the power to script it to a god you would never choose." },
    { id:"cm6", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Businesses should be legally required to publicly affirm the social values I hold.",
      reveal:"Compelled speech is compelled speech. The next administration writes the script you're forced to recite." },
    { id:"cm7", axis:"coercive_moralism", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"Government exists to make people virtuous, not merely to stop them from harming each other.",
      reveal:"This is the fork in the road: harm-prevention is a free society; virtue-enforcement is the seed of every morality police." },
    { id:"cm8", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Recreational drug use should be a crime because it is morally degrading.",
      reveal:"The same principle bans your wine, your caffeine, or your edibles the moment a different majority calls them degrading." },
    { id:"cm9", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Pornography between consenting adults should be outlawed.",
      reveal:"Grant the state a veto over private desire and it keeps the veto — for the next thing on the list, too." },
    { id:"cm10", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Advertising for products I consider harmful to society should be banned outright.",
      reveal:"'Harmful to society' is a blank the powerful fill in. Today it's their product; tomorrow it's your cause." },
    { id:"cm11", axis:"coercive_moralism", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"The law should enforce one shared moral code rather than tolerate competing lifestyles.",
      reveal:"One enforced moral code requires an enforcer — and you won't always be the one holding the whip." },
    { id:"cm12", axis:"coercive_moralism", type:"quote", weight:3, reverse:false, bait:"both",
      quote:"All within the state, nothing outside the state, nothing against the state.",
      author:"Benito Mussolini", source:"Address to the Chamber of Deputies (1928)",
      prompt:"Do you agree that everything should serve the nation — nothing outside it, nothing against it?",
      reveal:"That is Mussolini's own definition of totalitarian fascism, word for word." },

    /* --- Epistemic closure (extended) --- */
    { id:"ec5", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Advertisers should pull funding to shut down media that platforms views I find dangerous.",
      reveal:"Censorship by money is still censorship — and the boycott machine runs just as well against your side." },
    { id:"ec6", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Teachers should be fired for presenting history that portrays the nation negatively.",
      reveal:"A curriculum the state polices for patriotism is propaganda — you've just chosen who writes it." },
    { id:"ec7", axis:"epistemic_closure", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"It should be illegal to publicly question the official account of major historical events.",
      reveal:"Memory laws feel righteous until the 'official account' is written by someone you distrust." },
    { id:"ec8", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Scientific findings that could be socially harmful should be suppressed even when the evidence holds.",
      reveal:"Once 'harmful truths' can be buried, the person who decides what's harmful owns reality." },
    { id:"ec9", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Libraries should remove material that offends community moral standards.",
      reveal:"The community standard that pulls one book pulls the opposite book in the next town, or the next election." },
    { id:"ec10", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"A journalist who publishes leaked government secrets should go to prison.",
      reveal:"Every government calls its embarrassments 'secrets.' Jailing the messenger is how the powerful stay unaccountable." },
    { id:"ec11", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"The government should decide which foreign media its citizens are allowed to see.",
      reveal:"A state that curates your window on the world eventually paints the glass." },
    { id:"ec12", axis:"epistemic_closure", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"People who spread conspiracy theories should be legally silenced.",
      reveal:"You just agreed the state may decide which unpopular beliefs are sayable. The mechanism, not the belief, is the danger." },

    /* --- Autonomy denial (extended) --- */
    { id:"ad5", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"The state should be able to ban certain kinds of consensual sex between adults.",
      reveal:"Once the law is in the bedroom by invitation, it doesn't leave when the government changes hands." },
    { id:"ad6", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Unhealthy foods should be banned or heavily restricted for people's own good.",
      reveal:"Paternalism is paternalism. The nanny who bans your soda can ban your raw milk and your supplements too." },
    { id:"ad7", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Terminally ill adults should not be allowed to choose a medically assisted death.",
      reveal:"If your body is truly yours, the final decision is yours. Deny it here and you've handed the state your last door." },
    { id:"ad8", axis:"autonomy_denial", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"The government should be able to require a woman to carry a pregnancy to term.",
      reveal:"That is state power reaching into the body itself — the most intimate autonomy there is." },
    { id:"ad9", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"The state may mandate a medical procedure as a condition of participating in public life.",
      reveal:"Whether it's a shot you trust or one you don't, you've conceded the body belongs to the state when it decides the stakes." },
    { id:"ad10", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"The government should actively police citizens' diet, exercise, and lifestyle for their own health.",
      reveal:"A state responsible for your health claims authority over every choice that affects it — which is all of them." },
    { id:"ad11", axis:"autonomy_denial", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"A person's reproductive choices are a legitimate subject of government regulation.",
      reveal:"That is the doorway to eugenics — the state deciding who may reproduce, and how much." },
    { id:"ad12", axis:"autonomy_denial", type:"principle", weight:2, reverse:true, bait:"both",
      prompt:"Adults should be free to make choices that harm only themselves.",
      reveal:"This is Mill's harm principle. Agreeing here while agreeing to the items above is the exact contradiction this test exposes." },

    /* --- Out-group punishment (extended) --- */
    { id:"op4", axis:"outgroup_punishment", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"A majority may strip a minority of its rights if enough people vote for it.",
      reveal:"Rights a 51% vote can revoke are not rights — and next cycle you might be the 49%." },
    { id:"op5", axis:"outgroup_punishment", type:"quote", weight:3, reverse:false, bait:"left",
      quote:"Hatred as an element of struggle; unbending hatred for the enemy, that transforms us into effective, violent, selective, cold killing machines.",
      author:"Che Guevara", source:"Message to the Tricontinental (1967)",
      prompt:"Do you agree that hatred of the enemy is a necessary fuel for a just cause?",
      reveal:"That's Che Guevara (1967) — a hero on a million T-shirts — prescribing hatred as a tool and calling it virtue." },
    { id:"op6", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Immigrants from certain countries should be barred regardless of individual circumstances.",
      reveal:"Judging a person by their group, not their conduct, is the oldest engine of persecution there is." },
    { id:"op7", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"It is fair to judge an individual by the historical sins of their demographic group.",
      reveal:"Inherited collective guilt is the same machine whether it's aimed at a race, a religion, or a class." },
    { id:"op8", axis:"outgroup_punishment", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"In a crisis, the government should be able to detain members of a suspect group without trial.",
      reveal:"That is the exact justification for Japanese-American internment — a policy the nation now universally regrets." },
    { id:"op9", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"People who don't share the nation's dominant religion are less trustworthy citizens.",
      reveal:"Second-class citizenship by faith is where every religious persecution begins." },
    { id:"op10", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Certain groups should be excluded from public debate because of who they are.",
      reveal:"Deciding who is allowed to speak by identity is a power that always, eventually, turns around." },
    { id:"op11", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"A group that threatens the social order can justly be stripped of legal protection.",
      reveal:"'Threatens the social order' has justified the cage for dissidents, minorities, and reformers alike." },
    { id:"op12", axis:"outgroup_punishment", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Loyalty to the nation should be a legal condition of full civil rights.",
      reveal:"Rights contingent on loyalty are not rights — they're a leash, and the state decides when you've tugged it." },

    /* --- Retributive impulse (extended) --- */
    { id:"ri4", axis:"retributive_impulse", type:"principle", weight:3, reverse:false, bait:"both",
      prompt:"The main purpose of prison is to make criminals suffer, not to reduce future crime.",
      reveal:"If suffering is the point, evidence stops mattering — and a system that stops asking 'does it work?' can do anything." },
    { id:"ri5", axis:"retributive_impulse", type:"quote", weight:3, reverse:false, bait:"left",
      quote:"Terror is nothing other than justice, prompt, severe, inflexible.",
      author:"Maximilien Robespierre", source:"Speech on Political Morality, Feb 5, 1794",
      prompt:"Do you agree that against true enemies, swift and severe terror is simply justice?",
      reveal:"That's Robespierre defending the Reign of Terror — months before the same blade took his own head." },
    { id:"ri6", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Someone who said something offensive years ago deserves to be permanently unemployable.",
      reveal:"No appeal, no expiry, no proportion — that's not justice, it's a blacklist waiting to include you." },
    { id:"ri7", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"Petty criminals should face long mandatory sentences to send a message.",
      reveal:"Punishment as 'a message' treats a human being as a billboard — and the sentence never fits the person." },
    { id:"ri8", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Public shaming and humiliation are appropriate tools of justice.",
      reveal:"The stocks and the struggle session are the same instrument; only the crowd's politics change." },
    { id:"ri9", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Enough accusations should be sufficient to end someone's career, trial or not.",
      reveal:"Replace evidence with a headcount and you've rebuilt the witch trial — you're just hoping to stay off the list." },
    { id:"ri10", axis:"retributive_impulse", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"Torture is acceptable when used against someone we're sure is guilty.",
      reveal:"'Sure of guilt' is exactly the certainty every torturer has always claimed — and been wrong about." },
    { id:"ri11", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Mercy and rehabilitation make a justice system weak.",
      reveal:"A system that scorns mercy has removed its own brakes — and brakes are what protect the innocent." },
    { id:"ri12", axis:"retributive_impulse", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"It is better that some innocents be punished than that a guilty person escape.",
      reveal:"That inverts the founding rule of justice — and it is the precise logic of every show trial and purge." },

    /* --- Personalist deference (extended) --- */
    { id:"pd5", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"A leader who gets results should not be held back by 'process' and 'norms.'",
      reveal:"Process and norms are the only things standing between you and whatever the next leader wants to do." },
    { id:"pd6", axis:"personalist_deference", type:"principle", weight:3, reverse:false, bait:"right",
      prompt:"It's fine for a president to ignore a court ruling he believes is wrong.",
      reveal:"A leader who chooses which laws bind him is no longer under the law — he is the law." },
    { id:"pd7", axis:"personalist_deference", type:"principle", weight:3, reverse:false, bait:"left",
      prompt:"My side should use every lever of power without restraint, because our cause is just.",
      reveal:"'The ends justify the means' is the sentence that precedes every atrocity — including the ones done in your name." },
    { id:"pd8", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Term limits and checks on power mostly just get in the way of a good leader.",
      reveal:"Every check you remove for your leader stays removed for the one you fear." },
    { id:"pd9", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"Criticizing the leader during a national crisis is a form of betrayal.",
      reveal:"Equating dissent with treason is the first move of every strongman — and the last free thing you'll say." },
    { id:"pd10", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"right",
      prompt:"A strong leader is more important than strong institutions.",
      reveal:"Leaders die, defect, or turn. Institutions are what protect you when the leader is not on your side." },
    { id:"pd11", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"left",
      prompt:"Emergency powers should be used to push through policies that couldn't pass normally.",
      reveal:"An 'emergency' that bypasses the vote is how temporary power becomes permanent." },
    { id:"pd12", axis:"personalist_deference", type:"principle", weight:2, reverse:false, bait:"both",
      prompt:"History is made by great individuals, so we should trust them over rules.",
      reveal:"The great-man theory is the mission statement of every dictatorship. Rules outlast men for a reason." }
  ];

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

  return { AXES: AXES, OPTIONS: OPTIONS, QUESTIONS: QUESTIONS, ALIGNMENTS: ALIGNMENTS,
           SELF_SCALES: SELF_SCALES, ATTRIBUTES: ATTRIBUTES, TARGETS: TARGETS, NIEMOLLER: NIEMOLLER };
})();
