import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Brain, Clock, CheckCircle, XCircle, BarChart3, Sparkles, Loader2 } from 'lucide-react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";

// --- AWL WORD DATA (Updated with user-provided list) ---
const AWL_WORDS = {
  1: [
    { word: "analyse", definition: "to examine something in detail to understand it better", turkish: "analiz etmek, çözümlemek", example: "Scientists analyse data to draw meaningful conclusions." },
    { word: "approach", definition: "a way of dealing with something; to come near", turkish: "yaklaşım, yaklaşmak", example: "The researcher used a qualitative approach to study human behavior." },
    { word: "area", definition: "a particular part of a place, object, or surface; a subject or activity", turkish: "alan, bölge", example: "This area of research requires extensive fieldwork." },
    { word: "assess", definition: "to judge or decide the amount, value, quality, or importance of something", turkish: "değerlendirmek, ölçmek", example: "Teachers assess students' progress through various methods." },
    { word: "assume", definition: "to think that something is true without having proof", turkish: "varsaymak, üstlenmek", example: "We cannot assume that all participants understood the instructions." },
    { word: "authority", definition: "the power to control or command; an expert", turkish: "otorite, yetki", example: "The government has the authority to implement new policies." },
    { word: "available", definition: "able to be obtained, used, or reached", turkish: "mevcut, erişilebilir", example: "The data is available through the university's online database." },
    { word: "benefit", definition: "an advantage or profit gained from something", turkish: "fayda, yarar", example: "The benefits of exercise include improved physical and mental health." },
    { word: "concept", definition: "an idea or principle", turkish: "kavram, konsept", example: "The concept of democracy varies across different cultures." },
    { word: "consist", definition: "to be made up of or composed of", turkish: "oluşmak, meydana gelmek", example: "The research methodology consists of three main phases." },
    { word: "constitute", definition: "to be the parts that form something", turkish: "oluşturmak, teşkil etmek", example: "These findings constitute significant evidence for the theory." },
    { word: "context", definition: "the circumstances that form the setting", turkish: "bağlam, ortam", example: "Historical events must be understood within their proper context." },
    { word: "contract", definition: "a legal agreement; to become smaller", turkish: "sözleşme, daralma", example: "The company signed a contract with the research institution." },
    { word: "create", definition: "to bring something into existence", turkish: "yaratmak, oluşturmak", example: "Artists create works that reflect societal values." },
    { word: "data", definition: "facts and statistics collected for reference or analysis", turkish: "veri, bilgi", example: "The researchers collected data from over 500 participants." },
    { word: "define", definition: "to say what the meaning of something is", turkish: "tanımlamak, belirlemek", example: "It is important to clearly define the terms used in research." },
    { word: "derive", definition: "to get or obtain something from something else", turkish: "türetmek, elde etmek", example: "The conclusion was derived from extensive data analysis." },
    { word: "distribute", definition: "to give out or spread over an area", turkish: "dağıtmak, paylaştırmak", example: "The survey was distributed to all university students." },
    { word: "economy", definition: "the system of trade and industry in a country", turkish: "ekonomi, tasarruf", example: "The global economy affects local business practices." },
    { word: "environment", definition: "the surroundings or conditions in which something exists", turkish: "çevre, ortam", example: "Children's learning is influenced by their home environment." },
    { word: "establish", definition: "to set up or create something permanently", turkish: "kurmak, oluşturmak", example: "The university established a new research center last year." },
    { word: "estimate", definition: "to guess the cost, size, value, etc. of something", turkish: "tahmin etmek, değerlendirmek", example: "Experts estimate that the project will take three years to complete." },
    { word: "evident", definition: "easily seen or understood; obvious", turkish: "açık, belirgin", example: "The benefits of the new policy were evident within months." },
    { word: "export", definition: "to sell goods to another country", turkish: "ihracat, ihraç etmek", example: "The country's main export is agricultural products." },
    { word: "factor", definition: "something that influences a result", turkish: "faktör, etken", example: "Age is an important factor in language learning ability." },
    { word: "finance", definition: "the management of money", turkish: "finans, mali durum", example: "The research project received finance from multiple sources." },
    { word: "formula", definition: "a mathematical rule or a method for achieving something", turkish: "formül, reçete", example: "Scientists developed a new formula for calculating efficiency." },
    { word: "function", definition: "the purpose or role of something", turkish: "işlev, görev", example: "The primary function of education is to prepare students for life." },
    { word: "identify", definition: "to recognize or name someone or something", turkish: "tanımlamak, belirlemek", example: "Researchers must identify the key variables in their study." },
    { word: "income", definition: "money received from work or investments", turkish: "gelir, kazanç", example: "The study examined the relationship between education and income." },
    { word: "indicate", definition: "to show or suggest something", turkish: "göstermek, işaret etmek", example: "The results indicate a strong correlation between the variables." },
    { word: "individual", definition: "a single person; relating to one person", turkish: "birey, kişisel", example: "Each individual participant signed a consent form." },
    { word: "interpret", definition: "to explain the meaning of something", turkish: "yorumlamak, çevirmek", example: "Scholars interpret historical texts in different ways." },
    { word: "involve", definition: "to include someone or something in an activity", turkish: "içermek, dahil etmek", example: "The research project involved collaboration between three universities." },
    { word: "issue", definition: "an important problem for debate or discussion", turkish: "konu, sorun", example: "Climate change is a critical global issue." },
    { word: "labour", definition: "work that requires physical or mental effort", turkish: "emek, işgücü", example: "The industrial revolution changed the nature of manual labour." },
    { word: "legal", definition: "relating to the law", turkish: "yasal, hukuki", example: "All research must comply with legal and ethical standards." },
    { word: "legislate", definition: "to make laws", turkish: "yasa çıkarmak", example: "Parliament voted to legislate new environmental protections." },
    { word: "major", definition: "very large or important", turkish: "büyük, ana", example: "The study revealed major differences between the two groups." },
    { word: "method", definition: "a way of doing something", turkish: "yöntem, metot", example: "The researchers used qualitative methods to collect data." },
    { word: "occur", definition: "to happen", turkish: "meydana gelmek, gerçekleşmek", example: "Significant changes occur during adolescence." },
    { word: "percent", definition: "one part in every hundred", turkish: "yüzde", example: "Seventy percent of participants completed the survey." },
    { word: "period", definition: "a length of time", turkish: "dönem, süre", example: "The study was conducted over a two-year period." },
    { word: "policy", definition: "a course of action adopted by a government or organization", turkish: "politika, ilke", example: "The new education policy emphasizes critical thinking skills." },
    { word: "principle", definition: "a basic rule or belief", turkish: "ilke, prensip", example: "The research was based on the principle of informed consent." },
    { word: "proceed", definition: "to continue with a course of action", turkish: "devam etmek, ilerlemek", example: "After obtaining approval, the researchers proceeded with data collection." },
    { word: "process", definition: "a series of actions to achieve a result", turkish: "süreç, işlem", example: "Learning is a complex cognitive process." },
    { word: "require", definition: "to need something", turkish: "gerektirmek, ihtiyaç duymak", example: "Advanced research requires specialized equipment." },
    { word: "research", definition: "detailed study to discover new information", turkish: "araştırma", example: "Medical research has led to many life-saving treatments." },
    { word: "respond", definition: "to say or do something as a reaction", turkish: "yanıtlamak, karşılık vermek", example: "Participants were asked to respond to a series of questions." },
    { word: "role", definition: "the function or position of someone or something", turkish: "rol, görev", example: "Technology plays an important role in modern education." },
    { word: "section", definition: "a distinct part of something", turkish: "bölüm, kısım", example: "Each section of the report addresses a different aspect of the problem." },
    { word: "significant", definition: "large or important enough to be noticed", turkish: "önemli, anlamlı", example: "The study found significant improvements in student performance." },
    { word: "similar", definition: "almost the same but not exactly", turkish: "benzer, aynı", example: "The two studies produced similar results." },
    { word: "source", definition: "something that provides information or from which something comes", turkish: "kaynak, menba", example: "Academic papers must cite reliable sources." },
    { word: "specific", definition: "clearly defined or identified", turkish: "özel, belirli", example: "The research focused on specific learning difficulties." },
    { word: "structure", definition: "the way something is organized or built", turkish: "yapı, düzen", example: "The essay follows a clear organizational structure." },
    { word: "theory", definition: "an idea or set of ideas that explains something", turkish: "teori, kuram", example: "Darwin's theory of evolution revolutionized biology." },
    { word: "vary", definition: "to change or be different", turkish: "değişmek, farklılık göstermek", example: "Student performance varies according to study methods used." },
    { word: "variable", definition: "something that can change", turkish: "değişken, değişebilir", example: "Researchers controlled for several variables in their experiment." }
  ],
  2: [
    { word: "achieve", definition: "to succeed in finishing something or reaching an aim", turkish: "başarmak, elde etmek", example: "Students can achieve better results with proper guidance." },
    { word: "acquisition", definition: "the act of getting or obtaining something", turkish: "edinim, kazanım", example: "Language acquisition occurs naturally in early childhood." },
    { word: "administration", definition: "the process of organizing and running something", turkish: "yönetim, idare", example: "University administration handles student enrollment procedures." },
    { word: "affect", definition: "to influence or make changes to something", turkish: "etkilemek", example: "Poor nutrition can affect cognitive development in children." },
    { word: "appropriate", definition: "suitable for a particular situation", turkish: "uygun, yerinde", example: "It is important to use appropriate methodology for each research question." },
    { word: "aspect", definition: "one part or feature of something", turkish: "yön, boyut", example: "The study examined various aspects of student motivation." },
    { word: "assist", definition: "to help someone", turkish: "yardım etmek, destek olmak", example: "Teaching assistants help professors with research projects." },
    { word: "category", definition: "a group of things with similar characteristics", turkish: "kategori, sınıf", example: "The responses were divided into three main categories." },
    { word: "chapter", definition: "a section of a book", turkish: "bölüm, fasıl", example: "Chapter three discusses the methodology used in the study." },
    { word: "commission", definition: "a group of people given official responsibility for something", turkish: "komisyon, görevlendirme", example: "The ethics commission approved the research proposal." },
    { word: "community", definition: "a group of people living in the same area or sharing interests", turkish: "toplum, cemaat", example: "The local community participated in the environmental study." },
    { word: "complex", definition: "involving many different and connected parts", turkish: "karmaşık, kompleks", example: "Human behavior is influenced by complex social factors." },
    { word: "compute", definition: "to calculate using mathematics or computers", turkish: "hesaplamak, bilgisayarla işlemek", example: "Advanced software was used to compute the statistical results." },
    { word: "conclude", definition: "to decide that something is true after considering the evidence", turkish: "sonuçlandırmak, çıkarım yapmak", example: "Based on the evidence, researchers concluded that the hypothesis was correct." },
    { word: "conduct", definition: "to organize and carry out; behavior", turkish: "yürütmek, davranış", example: "The team conducted extensive interviews with participants." },
    { word: "consequent", definition: "following as a result", turkish: "sonuç olarak, bunun sonucunda", example: "The budget cuts and consequent reduction in staff affected research quality." },
    { word: "construct", definition: "to build or create something", turkish: "inşa etmek, oluşturmak", example: "Researchers construct theories based on empirical evidence." },
    { word: "consume", definition: "to use up or eat/drink something", turkish: "tüketmek, harcamak", example: "Modern societies consume vast amounts of natural resources." },
    { word: "credit", definition: "recognition for something; borrowed money", turkish: "kredi, takdir", example: "Students receive credit for completing research projects." },
    { word: "cultural", definition: "relating to the arts, beliefs, and customs of a society", turkish: "kültürel", example: "Cultural differences influence communication styles." },
    { word: "design", definition: "to plan how something will look or work", turkish: "tasarım, tasarlamak", example: "The experimental design ensured reliable results." },
    { word: "distinct", definition: "clearly different or separate", turkish: "belirgin, ayrı", example: "The study identified three distinct learning styles." },
    { word: "element", definition: "a basic part of something", turkish: "element, öğe", example: "Trust is an essential element in teacher-student relationships." },
    { word: "equation", definition: "a mathematical statement showing equality", turkish: "denklem, eşitlik", example: "The economic equation includes multiple variables." },
    { word: "evaluate", definition: "to judge the value or quality of something", turkish: "değerlendirmek, ölçmek", example: "Teachers evaluate student progress through various assessment methods." },
    { word: "feature", definition: "an important or noticeable characteristic", turkish: "özellik, nitelik", example: "The main feature of the program is its flexibility." },
    { word: "final", definition: "coming at the end; last", turkish: "son, nihai", example: "The final chapter summarizes the research findings." },
    { word: "focus", definition: "to concentrate attention on something", turkish: "odak, odaklanmak", example: "The study focused on adolescent behavioral patterns." },
    { word: "impact", definition: "a strong effect or influence", turkish: "etki, darbe", example: "Technology has had a significant impact on modern education." },
    { word: "injure", definition: "to hurt or damage someone or something", turkish: "yaralamak, zarar vermek", example: "Poor ergonomics can injure workers over time." },
    { word: "institute", definition: "an organization for education or research", turkish: "enstitü, kurmak", example: "The research institute specializes in environmental studies." },
    { word: "investment", definition: "money put into something to make a profit", turkish: "yatırım, sermaye", example: "Education is considered a long-term investment in human capital." },
    { word: "item", definition: "a single thing in a list or collection", turkish: "öğe, madde", example: "Each item on the questionnaire was carefully designed." },
    { word: "journal", definition: "a magazine dealing with a specialized subject", turkish: "dergi, günlük", example: "The research was published in a peer-reviewed journal." },
    { word: "maintain", definition: "to keep something in good condition", turkish: "sürdürmek, korumak", example: "Schools must maintain high academic standards." },
    { word: "normal", definition: "usual or typical", turkish: "normal, olağan", example: "It is normal for students to feel anxious before exams." },
    { word: "obtain", definition: "to get or acquire something", turkish: "elde etmek, kazanmak", example: "Researchers must obtain permission before collecting data." },
    { word: "participate", definition: "to take part in an activity", turkish: "katılmak, iştirak etmek", example: "All students are encouraged to participate in class discussions." },
    { word: "perceive", definition: "to become aware of something through the senses", turkish: "algılamak, kavramak", example: "Students perceive feedback differently depending on how it's delivered." },
    { word: "positive", definition: "good or favorable; optimistic", turkish: "pozitif, olumlu", example: "Positive reinforcement improves student motivation." },
    { word: "potential", definition: "possible but not yet actual", turkish: "potansiyel, olası", example: "The new technology has potential applications in education." },
    { word: "previous", definition: "happening before something else", turkish: "önceki, evvelki", example: "Previous studies have shown similar results." },
    { word: "primary", definition: "most important; first", turkish: "birincil, ana", example: "The primary goal of education is student learning." },
    { word: "purchase", definition: "to buy something", turkish: "satın alma, satın almak", example: "The university's purchase of new equipment improved research capabilities." },
    { word: "range", definition: "a set of different things of the same type", turkish: "aralık, çeşitlilik", example: "The survey covered a wide range of topics." },
    { word: "region", definition: "a particular area of a country or the world", turkish: "bölge, yöre", example: "Educational policies vary between different regions." },
    { word: "regulation", definition: "an official rule or law", turkish: "düzenleme, yönetmelik", example: "Safety regulations must be followed in all laboratory experiments." },
    { word: "relevant", definition: "connected with what is happening or being discussed", turkish: "ilgili, uygun", example: "Students should focus on relevant information when writing essays." },
    { word: "resident", definition: "a person who lives in a particular place", turkish: "yerleşik, ikamet eden", example: "Local residents were interviewed about community issues." },
    { word: "resource", definition: "something that can be used to help achieve an aim", turkish: "kaynak, rezerv", example: "The library provides valuable resources for researchers." },
    { word: "restrict", definition: "to limit or control something", turkish: "kısıtlamak, sınırlamak", example: "Budget constraints restrict the scope of the research project." },
    { word: "security", definition: "protection from danger or threat", turkish: "güvenlik, emniyet", example: "Data security is crucial in online research studies." },
    { word: "seek", definition: "to try to find or get something", turkish: "aramak, peşinde olmak", example: "Researchers seek to understand complex social phenomena." },
    { word: "select", definition: "to choose from a group", turkish: "seçmek, ayırmak", example: "Participants were randomly selected from the target population." },
    { word: "site", definition: "a place where something happens or is located", turkish: "yer, saha", example: "The archaeological site revealed important historical artifacts." },
    { word: "strategy", definition: "a plan for achieving something", turkish: "strateji, plan", example: "Effective teaching strategies improve student learning outcomes." },
    { word: "survey", definition: "an investigation to gather information", turkish: "anket, araştırma", example: "The survey revealed interesting patterns in consumer behavior." },
    { word: "text", definition: "written words", turkish: "metin, yazı", example: "Students analyzed various texts to understand literary themes." },
    { word: "traditional", definition: "following customs that have existed for a long time", turkish: "geleneksel, alışılmış", example: "Traditional teaching methods are being supplemented with technology." },
    { word: "transfer", definition: "to move from one place to another", turkish: "transfer etmek, aktarmak", example: "Skills learned in one context can transfer to new situations." }
  ],
  3: [
    { word: "alternative", definition: "offering a choice between two or more possibilities", turkish: "alternatif, seçenek", example: "Students can choose from several alternative assessment methods." },
    { word: "circumstance", definition: "a condition or fact that affects a situation", turkish: "durum, şartlar", example: "Learning outcomes vary depending on individual circumstances." },
    { word: "comment", definition: "a spoken or written remark expressing opinion", turkish: "yorum, açıklama", example: "The professor's comments helped improve the research proposal." },
    { word: "compensate", definition: "to provide something good to balance something bad", turkish: "telafi etmek, karşılamak", example: "Higher salaries compensate for the demanding nature of academic work." },
    { word: "component", definition: "one of several parts that together make up a whole", turkish: "bileşen, parça", example: "Critical thinking is an important component of academic success." },
    { word: "consent", definition: "agreement or permission", turkish: "rıza, onay", example: "Informed consent is required before participating in research studies." },
    { word: "considerable", definition: "large in size, amount, or degree", turkish: "önemli, kayda değer", example: "The new policy led to considerable improvements in student satisfaction." },
    { word: "constant", definition: "happening all the time or staying the same", turkish: "sabit, sürekli", example: "Constant practice is necessary to master academic writing skills." },
    { word: "constrain", definition: "to limit or restrict something", turkish: "kısıtlamak, zorlamak", example: "Limited funding constrains the scope of many research projects." },
    { word: "contribute", definition: "to give something to help achieve a result", turkish: "katkıda bulunmak, yardım etmek", example: "All team members contribute to the success of the research project." },
    { word: "convene", definition: "to come together or bring together for a meeting", turkish: "toplanmak, toplamak", example: "The committee will convene next week to discuss the proposals." },
    { word: "coordinate", definition: "to organize different parts to work together effectively", turkish: "koordine etmek, eşgüdüm sağlamak", example: "The research coordinator ensures all activities run smoothly." },
    { word: "core", definition: "the central or most important part", turkish: "çekirdek, temel", example: "Mathematics forms the core of many scientific disciplines." },
    { word: "corporate", definition: "relating to a large business company", turkish: "kurumsal, şirket", example: "Corporate funding supports much university research." },
    { word: "correspond", definition: "to be similar or related to something", turkish: "karşılık gelmek, yazışmak", example: "High motivation levels correspond with better academic performance." },
    { word: "criteria", definition: "standards on which judgments are based", turkish: "kriterler, ölçütler", example: "The evaluation criteria were clearly explained to all participants." },
    { word: "deduce", definition: "to reach a conclusion using reasoning", turkish: "çıkarım yapmak, sonuç çıkarmak", example: "From the evidence, we can deduce that the treatment was effective." },
    { word: "demonstrate", definition: "to show clearly that something exists or is true", turkish: "göstermek, kanıtlamak", example: "The experiment demonstrates the effectiveness of the new method." },
    { word: "document", definition: "a paper with official information; to record", turkish: "belge, belgelemek", example: "All procedures must be properly documented for future reference." },
    { word: "dominant", definition: "most important, powerful, or influential", turkish: "baskın, hakim", example: "Visual learning is the dominant style among art students." },
    { word: "emphasis", definition: "special importance given to something", turkish: "vurgu, önem", example: "The curriculum places emphasis on practical skills development." },
    { word: "ensure", definition: "to make certain that something happens", turkish: "sağlamak, garanti etmek", example: "Quality control measures ensure accurate research results." },
    { word: "exclude", definition: "to not include someone or something", turkish: "hariç tutmak, dışlamak", example: "Participants with certain medical conditions were excluded from the study." },
    { word: "framework", definition: "a basic structure underlying a system or concept", turkish: "çerçeve, iskelet", example: "The theoretical framework guides the research methodology." },
    { word: "fund", definition: "money for a particular purpose; to provide money", turkish: "fon, finanse etmek", example: "Government agencies fund most basic scientific research." },
    { word: "illustrate", definition: "to explain or make clear by using examples", turkish: "örneklendirmek, resimlemek", example: "Case studies illustrate the practical applications of the theory." },
    { word: "immigrate", definition: "to come to live permanently in a foreign country", turkish: "göç etmek, göçmen olmak", example: "Many scholars immigrate to pursue better research opportunities." },
    { word: "imply", definition: "to suggest something without saying it directly", turkish: "ima etmek, dolaylı olarak belirtmek", example: "The results imply that further investigation is needed." },
    { word: "initial", definition: "happening at the beginning", turkish: "ilk, başlangıç", example: "Initial findings suggest a promising direction for research." },
    { word: "instance", definition: "an example or particular case", turkish: "örnek, durum", example: "This is just one instance of how technology improves learning." },
    { word: "interact", definition: "to communicate or work together", turkish: "etkileşim kurmak, iletişim kurmak", example: "Students learn better when they interact with peers." },
    { word: "justify", definition: "to show that something is right or reasonable", turkish: "haklı göstermek, gerekçelendirmek", example: "Researchers must justify their choice of methodology." },
    { word: "layer", definition: "a quantity of something that covers a surface", turkish: "katman, tabaka", example: "Understanding requires multiple layers of analysis." },
    { word: "link", definition: "a connection between two things", turkish: "bağlantı, bağlamak", example: "Studies show a clear link between exercise and mental health." },
    { word: "locate", definition: "to find the exact position of something", turkish: "bulmak, yerini tespit etmek", example: "Researchers located the original documents in the archives." },
    { word: "maximize", definition: "to increase to the highest possible amount", turkish: "maksimize etmek, en üst düzeye çıkarmak", example: "Effective study strategies maximize learning outcomes." },
    { word: "minor", definition: "small or not very important", turkish: "küçük, önemsiz", example: "Only minor adjustments were needed to improve the design." },
    { word: "negate", definition: "to make something ineffective or invalid", turkish: "olumsuzlamak, geçersiz kılmak", example: "Poor methodology can negate the value of research findings." },
    { word: "outcome", definition: "the result or consequence of something", turkish: "sonuç, netice", example: "Student outcomes improved after implementing the new curriculum." },
    { word: "partner", definition: "someone who works with another person", turkish: "ortak, eş", example: "Universities often partner with industry for research projects." },
    { word: "philosophy", definition: "the study of fundamental questions about existence", turkish: "felsefe, düşünce", example: "Educational philosophy influences teaching practices." },
    { word: "physical", definition: "relating to the body or material things", turkish: "fiziksel, bedensel", example: "Physical exercise contributes to cognitive development." },
    { word: "proportion", definition: "a part or share of a whole", turkish: "oran, orantı", example: "A large proportion of students prefer online learning." },
    { word: "publish", definition: "to produce and distribute a book, article, etc.", turkish: "yayımlamak, basımlamak", example: "Academic researchers must publish their findings regularly." },
    { word: "react", definition: "to respond to something", turkish: "tepki vermek, karşılık vermek", example: "Students react differently to various teaching methods." },
    { word: "register", definition: "to record information officially", turkish: "kayıt, kaydetmek", example: "All participants must register before the conference begins." },
    { word: "rely", definition: "to depend on someone or something", turkish: "güvenmek, dayanmak", example: "Modern research relies heavily on statistical analysis." },
    { word: "remove", definition: "to take something away", turkish: "kaldırmak, çıkarmak", example: "Outliers were removed from the dataset before analysis." },
    { word: "scheme", definition: "a plan or system for achieving something", turkish: "plan, şema", example: "The coding scheme helped organize qualitative data." },
    { word: "sequence", definition: "a set of things that follow in a particular order", turkish: "sıra, dizi", example: "Learning occurs through a sequence of developmental stages." },
    { word: "sex", definition: "the biological distinction between male and female", turkish: "cinsiyet, seks", example: "The study examined differences between sex and gender identity." },
    { word: "shift", definition: "to move or change from one position to another", turkish: "değişim, kaydırma", example: "There has been a shift toward student-centered learning approaches." },
    { word: "specify", definition: "to state clearly and exactly", turkish: "belirtmek, açıklamak", example: "Instructions should specify exactly what students need to do." },
    { word: "sufficient", definition: "enough for a particular purpose", turkish: "yeterli, kâfi", example: "Sufficient evidence supports the theoretical framework." },
    { word: "task", definition: "a piece of work that needs to be done", turkish: "görev, iş", example: "Complex tasks require higher-order thinking skills." },
    { word: "technical", definition: "relating to practical skills or applied sciences", turkish: "teknik, mesleki", example: "Technical writing requires precision and clarity." },
    { word: "technique", definition: "a particular way of doing something", turkish: "teknik, yöntem", example: "Active learning techniques improve student engagement." },
    { word: "technology", definition: "the application of scientific knowledge for practical purposes", turkish: "teknoloji, teknik bilim", example: "Educational technology transforms traditional teaching methods." },
    { word: "valid", definition: "based on truth or reason; legally acceptable", turkish: "geçerli, doğru", example: "Valid assessment methods accurately measure student learning." },
    { word: "volume", definition: "the amount of space occupied; a book", turkish: "hacim, cilt", example: "This volume contains important research on cognitive psychology." }
  ],
  4: [
    { word: "access", definition: "the ability to enter or approach", turkish: "erişim, ulaşım", example: "Equal access to education is a fundamental human right." },
    { word: "adequate", definition: "enough in quantity or quality", turkish: "yeterli, uygun", example: "Adequate preparation is essential for academic success." },
    { word: "annual", definition: "happening once every year", turkish: "yıllık, senelik", example: "The annual conference brings together leading researchers." },
    { word: "apparent", definition: "clearly visible or understood", turkish: "belirgin, açık", example: "The benefits of collaborative learning are apparent to most educators." },
    { word: "approximate", definition: "close to the actual but not completely accurate", turkish: "yaklaşık, tahmini", example: "The approximate cost of the research project is $50,000." },
    { word: "attitude", definition: "a settled way of thinking about something", turkish: "tutum, yaklaşım", example: "Positive attitudes toward learning improve academic outcomes." },
    { word: "attribute", definition: "a characteristic; to regard as being caused by", turkish: "özellik, atfetmek", example: "Success can be attributed to hard work and effective strategies." },
    { word: "civil", definition: "relating to citizens and their concerns", turkish: "sivil, medeni", example: "Civil rights movements have shaped modern educational policies." },
    { word: "code", definition: "a system of signals or symbols for communication", turkish: "kod, şifre", example: "Researchers developed a coding system for analyzing interviews." },
    { word: "commit", definition: "to pledge or bind to a certain course", turkish: "taahhüt etmek, adamak", example: "Successful students commit significant time to their studies." },
    { word: "communicate", definition: "to share or exchange information", turkish: "iletişim kurmak, bildirmek", example: "Teachers must communicate expectations clearly to students." },
    { word: "concentrate", definition: "to focus attention or effort on something", turkish: "konsantre olmak, yoğunlaşmak", example: "Students need quiet environments to concentrate effectively." },
    { word: "confer", definition: "to discuss or grant something", turkish: "danışmak, vermek", example: "The committee will confer honorary degrees at graduation." },
    { word: "contrast", definition: "to compare showing differences", turkish: "karşıtlık, karşılaştırmak", example: "The study contrasts traditional and modern teaching methods." },
    { word: "cycle", definition: "a series of events that repeat regularly", turkish: "döngü, devir", example: "The learning cycle includes input, processing, and output phases." },
    { word: "debate", definition: "formal discussion of opposing views", turkish: "tartışma, münazara", example: "Academic debates help refine theoretical understanding." },
    { word: "despite", definition: "without being affected by something", turkish: "rağmen, karşın", example: "Despite initial difficulties, the research project succeeded." },
    { word: "dimension", definition: "an aspect or feature of a situation", turkish: "boyut, ölçü", example: "The study examined multiple dimensions of student motivation." },
    { word: "domestic", definition: "relating to one's own country or household", turkish: "yerel, ev içi", example: "Domestic policies affect educational funding and access." },
    { word: "emerge", definition: "to come into view or become apparent", turkish: "ortaya çıkmak, belirmek", example: "New patterns emerged from the longitudinal data analysis." },
    { word: "error", definition: "a mistake or inaccuracy", turkish: "hata, yanlış", example: "Systematic errors can compromise research validity." },
    { word: "ethnic", definition: "relating to a group sharing cultural traditions", turkish: "etnik, ulusal", example: "The university promotes ethnic diversity in its programs." },
    { word: "goal", definition: "something you want to achieve", turkish: "hedef, amaç", example: "Setting clear goals improves academic performance." },
    { word: "grant", definition: "money given for a purpose; to give formally", turkish: "hibe, vermek", example: "Research grants enable universities to conduct advanced studies." },
    { word: "hence", definition: "as a consequence; therefore", turkish: "dolayısıyla, bundan dolayı", example: "The methodology was flawed; hence, the results are questionable." },
    { word: "hypothesis", definition: "a proposed explanation for something", turkish: "hipotez, varsayım", example: "The research hypothesis predicted a positive correlation." },
    { word: "implement", definition: "to put a plan or decision into effect", turkish: "uygulamak, gerçekleştirmek", example: "Schools implement new policies gradually to ensure success." },
    { word: "implicate", definition: "to show involvement in something", turkish: "içermek, suçlamak", example: "The findings implicate environmental factors in learning difficulties." },
    { word: "impose", definition: "to force something on someone", turkish: "dayatmak, yüklemek", example: "Strict deadlines impose pressure on research teams." },
    { word: "integrate", definition: "to combine things to form a whole", turkish: "entegre etmek, bütünleştirmek", example: "Modern curricula integrate theory with practical application." },
    { word: "internal", definition: "existing or happening inside", turkish: "iç, dahili", example: "Internal validation strengthens research credibility." },
    { word: "investigate", definition: "to examine something carefully", turkish: "araştırmak, soruşturmak", example: "Researchers investigate the causes of learning disabilities." },
    { word: "job", definition: "paid work or employment", turkish: "iş, meslek", example: "Graduate education prepares students for specialized jobs." },
    { word: "label", definition: "a piece of information; to assign a category", turkish: "etiket, etiketlemek", example: "Researchers must avoid labeling participants inappropriately." },
    { word: "mechanism", definition: "a process by which something works", turkish: "mekanizma, sistem", example: "Feedback mechanisms help improve teaching quality." },
    { word: "obvious", definition: "easily seen, recognized, or understood", turkish: "açık, belli", example: "The obvious solution was to increase study time." },
    { word: "occupy", definition: "to fill or take up space or time", turkish: "işgal etmek, meşgul etmek", example: "Research activities occupy most professors' time." },
    { word: "option", definition: "a choice between different possibilities", turkish: "seçenek, opsiyon", example: "Students have multiple options for fulfilling requirements." },
    { word: "output", definition: "the amount produced or achieved", turkish: "çıktı, üretim", example: "Research output is measured by publications and citations." },
    { word: "overall", definition: "considering everything; total", turkish: "genel, toplam", example: "Overall, the intervention showed positive effects." },
    { word: "parallel", definition: "similar and happening at the same time", turkish: "paralel, benzer", example: "Parallel studies in different countries confirmed the findings." },
    { word: "parameter", definition: "a limit that affects how something can be done", turkish: "parametre, sınır", example: "The study's parameters were clearly defined beforehand." },
    { word: "phase", definition: "a distinct stage in development", turkish: "aşama, evre", example: "The research project consists of three main phases." },
    { word: "predict", definition: "to say what will happen in the future", turkish: "tahmin etmek, öngörmek", example: "Models help predict student learning outcomes." },
    { word: "principal", definition: "most important; the head of a school", turkish: "ana, temel", example: "The principal investigator leads the research team." },
    { word: "prior", definition: "happening before something else", turkish: "önceki, evvelki", example: "Prior experience influences learning new concepts." },
    { word: "professional", definition: "relating to skilled work or showing high standards", turkish: "profesyonel, mesleki", example: "Professional development improves teaching effectiveness." },
    { word: "project", definition: "a planned piece of work; to estimate", turkish: "proje, öngörmek", example: "Student projects demonstrate practical application of knowledge." },
    { word: "promote", definition: "to encourage or support; to advance in rank", turkish: "desteklemek, terfi ettirmek", example: "Universities promote excellence in teaching and research." },
    { word: "regime", definition: "a system of government or management", turkish: "rejim, düzen", example: "The new assessment regime emphasizes continuous evaluation." },
    { word: "resolution", definition: "finding an answer to a problem", turkish: "çözüm, karar", example: "Conflict resolution skills are important for group work." },
    { word: "retain", definition: "to keep or continue to have something", turkish: "korumak, akılda tutmak", example: "Students retain information better through active learning." },
    { word: "series", definition: "a number of things following one after another", turkish: "seri, dizi", example: "The workshop consists of a series of interactive sessions." },
    { word: "statistic", definition: "numerical facts collected for analysis", turkish: "istatistik, sayısal veri", example: "Educational statistics guide policy development." },
    { word: "status", definition: "position or condition at a particular time", turkish: "durum, statü", example: "Socioeconomic status affects educational opportunities." },
    { word: "stress", definition: "pressure or strain; to emphasize", turkish: "stres, vurgulamak", example: "Academic stress can impact student well-being." },
    { word: "subsequent", definition: "coming after something else", turkish: "sonraki, müteakip", example: "Subsequent studies confirmed the initial findings." },
    { word: "sum", definition: "the total amount; to summarize", turkish: "toplam, özetlemek", example: "The sum of evidence supports the theoretical model." },
    { word: "summary", definition: "a brief statement of main points", turkish: "özet, hulasa", example: "Each chapter ends with a summary of key concepts." },
    { word: "undertake", definition: "to begin or attempt something", turkish: "üstlenmek, girişmek", example: "Graduate students undertake independent research projects." }
  ],
  5: [
    { word: "academic", definition: "relating to education and scholarship", turkish: "akademik, öğretim", example: "Academic writing requires formal structure and evidence." },
    { word: "adjust", definition: "to change slightly to make more suitable", turkish: "ayarlamak, uyarlamak", example: "Teachers adjust their methods based on student feedback." },
    { word: "alter", definition: "to change or modify something", turkish: "değiştirmek, değişiklik yapmak", example: "Digital technology has altered traditional learning environments." },
    { word: "amend", definition: "to make minor changes to improve something", turkish: "değiştirmek, düzeltmek", example: "The research proposal was amended based on committee feedback." },
    { word: "aware", definition: "having knowledge or perception of something", turkish: "farkında, bilinçli", example: "Students should be aware of plagiarism consequences." },
    { word: "capacity", definition: "ability or maximum amount that can be contained", turkish: "kapasite, yetenek", example: "Working memory capacity affects learning performance." },
    { word: "challenge", definition: "a difficult task; to question something", turkish: "meydan okuma, zorluk", example: "Critical thinking involves challenging existing assumptions." },
    { word: "clause", definition: "a section of a legal document; part of a sentence", turkish: "madde, cümle", example: "The contract includes a clause about intellectual property rights." },
    { word: "compound", definition: "consisting of two or more parts", turkish: "bileşik, karmaşık", example: "Complex learning involves compound cognitive processes." },
    { word: "conflict", definition: "disagreement or incompatibility", turkish: "çatışma, uyuşmazlık", example: "Theoretical conflicts lead to paradigm shifts in science." },
    { word: "consult", definition: "to seek advice or information from someone", turkish: "danışmak, başvurmak", example: "Students should consult multiple sources for research papers." },
    { word: "contact", definition: "communication or physical touch", turkish: "temas, iletişim", example: "Regular contact with advisors helps graduate students progress." },
    { word: "decline", definition: "to decrease or refuse politely", turkish: "azalma, reddetmek", example: "Test scores showed a decline after the policy change." },
    { word: "discrete", definition: "individually separate and distinct", turkish: "ayrı, kesikli", example: "Learning involves discrete stages of cognitive development." },
    { word: "draft", definition: "a preliminary version; to prepare", turkish: "taslak, çizmek", example: "Students submit multiple drafts before final paper submission." },
    { word: "enable", definition: "to make something possible", turkish: "mümkün kılmak, sağlamak", example: "Technology enables new forms of collaborative learning." },
    { word: "energy", definition: "power derived from physical or chemical resources", turkish: "enerji, güç", example: "Sustainable energy research attracts significant funding." },
    { word: "enforce", definition: "to make sure rules are obeyed", turkish: "uygulamak, zorlamak", example: "Academic institutions enforce strict plagiarism policies." },
    { word: "entity", definition: "something that exists as a single unit", turkish: "varlık, kuruluş", example: "Universities are complex entities with multiple stakeholders." },
    { word: "equivalent", definition: "equal in value, amount, or meaning", turkish: "eşdeğer, eşit", example: "International students need equivalent qualifications for admission." },
    { word: "evolve", definition: "to develop gradually", turkish: "evrimleşmek, gelişmek", example: "Educational practices evolve with technological advances." },
    { word: "expand", definition: "to increase in size or scope", turkish: "genişletmek, büyütmek", example: "Universities expand their programs to meet student demand." },
    { word: "expose", definition: "to reveal or make vulnerable to something", turkish: "maruz bırakmak, açığa çıkarmak", example: "Study abroad programs expose students to different cultures." },
    { word: "external", definition: "coming from outside", turkish: "dış, harici", example: "External funding supports independent research projects." },
    { word: "facilitate", definition: "to make something easier or help achieve", turkish: "kolaylaştırmak, desteklemek", example: "Peer tutoring facilitates collaborative learning." },
    { word: "fundamental", definition: "basic and important", turkish: "temel, esas", example: "Critical thinking is fundamental to academic success." },
    { word: "generate", definition: "to produce or create something", turkish: "üretmek, yaratmak", example: "Research activities generate new knowledge and understanding." },
    { word: "generation", definition: "people born around the same time; production", turkish: "nesil, üretim", example: "Each generation of students brings different learning preferences." },
    { word: "image", definition: "a picture or impression of something", turkish: "görüntü, imaj", example: "Visual images enhance understanding of complex concepts." },
    { word: "liberal", definition: "open to new ideas; generous", turkish: "liberal, özgürlükçü", example: "Liberal arts education emphasizes broad knowledge areas." },
    { word: "license", definition: "official permission to do something", turkish: "lisans, ruhsat", example: "Professional teachers must obtain teaching licenses." },
    { word: "logic", definition: "reasoning conducted according to strict principles", turkish: "mantık, akıl", example: "Mathematical logic forms the basis of computer programming." },
    { word: "margin", definition: "edge or border; amount of difference", turkish: "kenar boşluğu, marj", example: "Academic papers require specific margin formatting." },
    { word: "medical", definition: "relating to medicine or treatment of illness", turkish: "tıbbi, medikal", example: "Medical research requires strict ethical oversight." },
    { word: "mental", definition: "relating to the mind", turkish: "zihinsel, mental", example: "Mental health support is crucial for student success." },
    { word: "modify", definition: "to change something slightly", turkish: "değiştirmek, düzenlemek", example: "Teachers modify assignments to meet diverse learning needs." },
    { word: "monitor", definition: "to observe and check progress over time", turkish: "izlemek, takip etmek", example: "Continuous assessment helps monitor student learning." },
    { word: "network", definition: "a system of interconnected people or things", turkish: "ağ, şebeke", example: "Professional networks provide career opportunities for graduates." },
    { word: "notion", definition: "a conception or belief about something", turkish: "kavram, fikir", example: "The notion of intelligence has evolved significantly." },
    { word: "objective", definition: "a goal; not influenced by personal feelings", turkish: "amaç, objektif", example: "Research should maintain objective analysis of data." },
    { word: "orient", definition: "to direct toward or familiarize with", turkish: "yöneltmek, uyum sağlamak", example: "Orientation programs help new students adapt to university life." },
    { word: "perspective", definition: "a particular way of viewing things", turkish: "bakış açısı, perspektif", example: "Multiple perspectives enrich academic discussions." },
    { word: "precise", definition: "exact and accurate", turkish: "kesin, hassas", example: "Scientific measurements require precise instrumentation." },
    { word: "prime", definition: "most important; first in order", turkish: "birincil, ana", example: "Research quality is the prime concern of academic institutions." },
    { word: "psychology", definition: "the study of mind and behavior", turkish: "psikoloji", example: "Educational psychology informs teaching practices." },
    { word: "pursue", definition: "to follow or chase; to continue with", turkish: "peşinde koşmak, izlemek", example: "Graduate students pursue specialized research interests." },
    { word: "ratio", definition: "the relationship between two amounts", turkish: "oran, nispet", example: "The student-to-teacher ratio affects learning quality." },
    { word: "reject", definition: "to refuse to accept or consider", turkish: "reddetmek, geri çevirmek", example: "Peer reviewers may reject papers for methodological flaws." },
    { word: "revenue", definition: "income from business operations", turkish: "gelir, hasılat", example: "Tuition fees generate significant revenue for universities." },
    { word: "stable", definition: "firmly fixed; not likely to change", turkish: "kararlı, sabit", example: "Stable funding ensures consistent research programs." },
    { word: "style", definition: "a distinctive way of doing something", turkish: "stil, tarz", example: "Academic writing style differs from journalistic writing." },
    { word: "substitute", definition: "to use instead of something else", turkish: "yerine koymak, vekil", example: "Online simulations can substitute for laboratory experiments." },
    { word: "sustain", definition: "to maintain or support over time", turkish: "sürdürmek, desteklemek", example: "Universities seek to sustain excellence in education." },
    { word: "symbol", definition: "something representing something else", turkish: "sembol, simge", example: "Mathematical symbols represent abstract concepts." },
    { word: "target", definition: "an aim or objective", turkish: "hedef, amaçlamak", example: "Educational programs target specific learning outcomes." },
    { word: "transit", definition: "the process of moving from one place to another", turkish: "geçiş, nakil", example: "Students in transit between programs need academic advising." },
    { word: "trend", definition: "a general direction of change", turkish: "eğilim, trend", example: "Current trends favor competency-based education." },
    { word: "version", definition: "a particular form of something", turkish: "versiyon, çeşit", example: "The revised version of the curriculum includes new requirements." },
    { word: "welfare", definition: "health, happiness, and well-being", turkish: "refah, iyilik", example: "Student welfare services support academic and personal development." },
    { word: "whereas", definition: "while on the contrary", turkish: "oysa, halbuki", example: "Theory emphasizes concepts, whereas practice focuses on application." }
  ],
  6: [
    { word: "abstract", definition: "existing as an idea; a summary", turkish: "soyut, özet", example: "Abstract thinking develops through higher education." },
    { word: "accurate", definition: "correct in all details", turkish: "doğru, kesin", example: "Accurate data collection is essential for valid research." },
    { word: "acknowledge", definition: "to accept or admit the existence of something", turkish: "kabul etmek, onaylamak", example: "Authors must acknowledge all sources used in their work." },
    { word: "aggregate", definition: "a total; to combine into a whole", turkish: "toplam, bir araya getirmek", example: "Aggregate test scores show overall program effectiveness." },
    { word: "allocate", definition: "to distribute or assign for a specific purpose", turkish: "tahsis etmek, ayırmak", example: "Universities allocate resources based on strategic priorities." },
    { word: "assign", definition: "to give a task or designate for a purpose", turkish: "atamak, vermek", example: "Professors assign readings to supplement lecture content." },
    { word: "attach", definition: "to fasten or connect to something", turkish: "eklemek, bağlamak", example: "Students attach supporting documents to their applications." },
    { word: "author", definition: "a writer of a book or article", turkish: "yazar, oluşturan", example: "Academic authors must follow ethical publication guidelines." },
    { word: "bond", definition: "a connection between people; a financial instrument", turkish: "bağ, tahvil", example: "Strong bonds between students and teachers improve learning." },
    { word: "brief", definition: "lasting only a short time; a summary", turkish: "kısa, özet", example: "The conference presentation was brief but informative." },
    { word: "capable", definition: "having the ability to do something", turkish: "yetenekli, muktedir", example: "Students become capable researchers through graduate training." },
    { word: "cite", definition: "to quote or refer to as evidence", turkish: "alıntı yapmak, kaynak göstermek", example: "Academic writers must cite sources to avoid plagiarism." },
    { word: "cooperate", definition: "to work together toward a common goal", turkish: "işbirliği yapmak, yardımlaşmak", example: "Research teams cooperate to solve complex problems." },
    { word: "discriminate", definition: "to recognize differences; to treat unfairly", turkish: "ayırt etmek, ayrımcılık yapmak", example: "Good assessment tools discriminate between competency levels." },
    { word: "display", definition: "to show or exhibit something", turkish: "sergilemek, göstermek", example: "Student work is displayed in hallway exhibitions." },
    { word: "diverse", definition: "showing variety or differences", turkish: "çeşitli, farklı", example: "Diverse learning activities accommodate different student needs." },
    { word: "domain", definition: "an area of knowledge or activity", turkish: "alan, bölge", example: "Each academic domain has its own research methodologies." },
    { word: "edit", definition: "to prepare text for publication by correcting", turkish: "düzenlemek, redakte etmek", example: "Peer editing improves the quality of student writing." },
    { word: "enhance", definition: "to improve the quality or value of something", turkish: "geliştirmek, artırmak", example: "Multimedia presentations enhance student engagement." },
    { word: "estate", definition: "property or assets owned by someone", turkish: "mülk, emlak", example: "The university's real estate includes multiple campus buildings." },
    { word: "exceed", definition: "to go beyond a limit or expectation", turkish: "aşmak, geçmek", example: "High-achieving students often exceed minimum requirements." },
    { word: "expert", definition: "a person with special knowledge or skill", turkish: "uzman, mahir", example: "Subject matter experts review curriculum proposals." },
    { word: "explicit", definition: "clearly and exactly expressed", turkish: "açık, belirgin", example: "Learning objectives should be explicit and measurable." },
    { word: "federal", definition: "relating to a system of government", turkish: "federal, birlik", example: "Federal funding supports university research programs." },
    { word: "fee", definition: "payment for professional services", turkish: "ücret, harç", example: "Application fees help cover administrative processing costs." },
    { word: "flexible", definition: "able to change or be adapted easily", turkish: "esnek, uyarlanabilir", example: "Flexible scheduling accommodates working students' needs." },
    { word: "furthermore", definition: "in addition; moreover", turkish: "üstelik, ayrıca", example: "The results were significant; furthermore, they were replicated." },
    { word: "gender", definition: "social and cultural differences between sexes", turkish: "cinsiyet, toplumsal cinsiyet", example: "Gender equality in education remains an important goal." },
    { word: "ignorant", definition: "lacking knowledge or awareness", turkish: "cahil, bilgisiz", example: "Students should not remain ignorant of ethical research practices." },
    { word: "incentive", definition: "something that motivates action", turkish: "teşvik, özendirici", example: "Grade incentives can motivate student participation." },
    { word: "incidence", definition: "the rate of occurrence of something", turkish: "olay, sıklık", example: "The incidence of plagiarism decreased after honor code implementation." },
    { word: "incorporate", definition: "to include as part of a whole", turkish: "birleştirmek, dahil etmek", example: "Modern curricula incorporate technology across disciplines." },
    { word: "index", definition: "an alphabetical list; a measure of change", turkish: "dizin, endeks", example: "The book's index helps readers locate specific topics." },
    { word: "inhibit", definition: "to prevent or restrict something", turkish: "engellemek, kısıtlamak", example: "Test anxiety can inhibit student performance." },
    { word: "initiate", definition: "to begin or start something", turkish: "başlatmak, girişmek", example: "Faculty members initiate new research collaborations." },
    { word: "input", definition: "data entered into a system; contribution", turkish: "girdi, katkı", example: "Student input shapes curriculum development processes." },
    { word: "instruct", definition: "to give directions or teach someone", turkish: "talimat vermek, öğretmek", example: "Teachers instruct students in critical thinking skills." },
    { word: "intelligent", definition: "having good understanding or quick learning ability", turkish: "zeki, akıllı", example: "Intelligent tutoring systems adapt to individual learning needs." },
    { word: "interval", definition: "a space of time between events", turkish: "aralık, süre", example: "Regular intervals between study sessions improve retention." },
    { word: "lecture", definition: "an educational talk to students", turkish: "ders, konferans", example: "Interactive lectures engage students more than passive listening." },
    { word: "migrate", definition: "to move from one place to another", turkish: "göç etmek, taşınmak", example: "Students often migrate to cities with better universities." },
    { word: "minimum", definition: "the smallest amount possible", turkish: "minimum, en az", example: "Programs require a minimum number of credit hours." },
    { word: "ministry", definition: "a government department", turkish: "bakanlık, din hizmeti", example: "The Ministry of Education sets national curriculum standards." },
    { word: "motive", definition: "a reason for doing something", turkish: "güdü, sebep", example: "Understanding student motives helps improve teaching methods." },
    { word: "neutral", definition: "not supporting either side in a conflict", turkish: "tarafsız, nötr", example: "Academic research should maintain neutral perspectives." },
    { word: "nevertheless", definition: "in spite of what has just been said", turkish: "yine de, buna rağmen", example: "The study had limitations; nevertheless, the findings were valuable." },
    { word: "overseas", definition: "in or to a foreign country", turkish: "denizaşırı, yurtdışı", example: "Overseas study programs broaden students' perspectives." },
    { word: "precede", definition: "to come before something in time or order", turkish: "önce gelmek, öncülük etmek", example: "Theoretical knowledge should precede practical application." },
    { word: "presumption", definition: "an assumption based on reasonable evidence", turkish: "varsayım, tahmin", example: "The presumption is that students have completed prerequisites." },
    { word: "rational", definition: "based on reason rather than emotion", turkish: "mantıklı, akılcı", example: "Rational decision-making improves educational outcomes." },
    { word: "recover", definition: "to return to a normal state", turkish: "iyileşmek, geri kazanmak", example: "Students can recover from academic setbacks with proper support." },
    { word: "reveal", definition: "to make known or show", turkish: "açığa çıkarmak, ortaya koymak", example: "Longitudinal studies reveal patterns of student development." },
    { word: "scope", definition: "the range or extent of something", turkish: "kapsam, alan", example: "The research scope includes both quantitative and qualitative data." },
    { word: "subsidy", definition: "financial support from government", turkish: "sübvansiyon, mali yardım", example: "Government subsidies make higher education more accessible." },
    { word: "tape", definition: "to record; a narrow strip of material", turkish: "kaydetmek, bant", example: "Interviews were taped with participants' permission." },
    { word: "trace", definition: "to find or follow the course of something", turkish: "iz sürmek, izlemek", example: "Researchers trace the development of cognitive abilities." },
    { word: "transform", definition: "to change completely", turkish: "dönüştürmek, değiştirmek", example: "Digital technology transforms traditional classroom practices." },
    { word: "transport", definition: "to carry from one place to another", turkish: "taşımak, ulaşım", example: "Public transport connects students to campus facilities." },
    { word: "underlie", definition: "to be the cause or basis of something", turkish: "temelinde yatmak, altında olmak", example: "Cognitive theories underlie modern educational practices." },
    { word: "utility", definition: "usefulness or practical value", turkish: "fayda, kullanışlılık", example: "The utility of research depends on its real-world applications." }
  ],
  7: [
    { word: "adapt", definition: "to change to suit new conditions", turkish: "uyarlamak, adapte etmek", example: "Teachers adapt their methods to accommodate diverse learners." },
    { word: "adult", definition: "a fully grown person", turkish: "yetişkin, olgun", example: "Adult learners bring valuable experience to classroom discussions." },
    { word: "advocate", definition: "to publicly support or recommend", turkish: "savunmak, desteklemek", example: "Education advocates promote increased school funding." },
    { word: "aid", definition: "help or assistance", turkish: "yardım, destek", example: "Financial aid makes higher education accessible to more students." },
    { word: "channel", definition: "a route or medium for communication", turkish: "kanal, yönlendirmek", example: "Social media channels facilitate student-teacher communication." },
    { word: "chemical", definition: "relating to chemistry or chemicals", turkish: "kimyasal, kimya ile ilgili", example: "Chemical analysis reveals the composition of unknown substances." },
    { word: "classic", definition: "traditional and long-established", turkish: "klasik, geleneksel", example: "Classic literature remains relevant to modern students." },
    { word: "comprehensive", definition: "including everything; complete", turkish: "kapsamlı, geniş", example: "Comprehensive exams test students' overall program knowledge." },
    { word: "comprise", definition: "to consist of or include", turkish: "içermek, oluşmak", example: "The curriculum comprises both theoretical and practical components." },
    { word: "confirm", definition: "to establish that something is true", turkish: "doğrulamak, onaylamak", example: "Follow-up studies confirm the original research findings." },
    { word: "contrary", definition: "opposite in nature or direction", turkish: "karşıt, zıt", example: "Contrary to expectations, online learning improved retention rates." },
    { word: "convert", definition: "to change from one form to another", turkish: "dönüştürmek, çevirmek", example: "Software can convert text documents to multiple formats." },
    { word: "couple", definition: "two people or things; a small number", turkish: "çift, birkaç", example: "A couple of revisions improved the research proposal significantly." },
    { word: "decade", definition: "a period of ten years", turkish: "on yıl, onyıl", example: "Educational technology has advanced rapidly over the past decade." },
    { word: "definite", definition: "clearly stated or decided", turkish: "kesin, belirli", example: "The research proposal needs definite objectives and timelines." },
    { word: "deny", definition: "to state that something is not true", turkish: "reddetmek, inkar etmek", example: "Researchers cannot deny the limitations of their methodology." },
    { word: "differentiate", definition: "to recognize differences between things", turkish: "ayırt etmek, farklılaştırmak", example: "Teachers differentiate instruction to meet individual needs." },
    { word: "dispose", definition: "to get rid of; to arrange", turkish: "atmak, düzenlemek", example: "Laboratories must properly dispose of hazardous materials." },
    { word: "dynamic", definition: "characterized by constant change or activity", turkish: "dinamik, hareketli", example: "Dynamic classrooms encourage active student participation." },
    { word: "eliminate", definition: "to remove or get rid of completely", turkish: "ortadan kaldırmak, elemek", example: "Quality control measures eliminate errors in data collection." },
    { word: "empirical", definition: "based on observation or experience", turkish: "deneysel, gözlemsel", example: "Empirical research provides evidence for theoretical claims." },
    { word: "equipment", definition: "necessary items for a particular purpose", turkish: "ekipman, donanım", example: "Modern laboratories require sophisticated scientific equipment." },
    { word: "extract", definition: "to remove or take out", turkish: "çıkarmak, özütlemek", example: "Researchers extract key themes from interview data." },
    { word: "file", definition: "a collection of papers or digital data", turkish: "dosya, kayıt", example: "Student records are kept in confidential digital files." },
    { word: "finite", definition: "having limits or bounds", turkish: "sınırlı, sonlu", example: "Universities have finite resources for research projects." },
    { word: "foundation", definition: "underlying basis; an organization", turkish: "temel, vakıf", example: "Strong literacy skills provide the foundation for academic success." },
    { word: "global", definition: "relating to the whole world", turkish: "küresel, evrensel", example: "Global collaboration advances scientific research." },
    { word: "grade", definition: "a level of quality; to assess work", turkish: "not, seviye", example: "Fair grading practices ensure accurate assessment of learning." },
    { word: "guarantee", definition: "a promise that something will happen", turkish: "garanti, güvence", example: "Hard work doesn't guarantee academic success, but it helps." },
    { word: "hierarchy", definition: "a system of organization with ranks", turkish: "hiyerarşi, sıralama", example: "Academic institutions have complex administrative hierarchies." },
    { word: "identical", definition: "exactly the same", turkish: "aynı, özdeş", example: "Identical research procedures ensure reliable comparisons." },
    { word: "ideology", definition: "a system of ideas and ideals", turkish: "ideoloji, düşünce sistemi", example: "Educational ideologies influence curriculum design and implementation." },
    { word: "infer", definition: "to deduce from evidence and reasoning", turkish: "çıkarım yapmak, sonuç çıkarmak", example: "Students learn to infer meaning from contextual clues." },
    { word: "innovate", definition: "to introduce new ideas or methods", turkish: "yenilik yapmak, buluş yapmak", example: "Universities encourage faculty to innovate in teaching methods." },
    { word: "insert", definition: "to put something into something else", turkish: "eklemek, sokmak", example: "Students insert citations throughout their research papers." },
    { word: "intervention", definition: "action taken to improve a situation", turkish: "müdahale, araya girme", example: "Early intervention helps students overcome learning difficulties." },
    { word: "isolate", definition: "to separate from others", turkish: "yalıtmak, ayırmak", example: "Researchers isolate variables to test specific hypotheses." },
    { word: "media", definition: "means of mass communication", turkish: "medya, araçlar", example: "Social media platforms transform student communication patterns." },
    { word: "mode", definition: "a way of doing something", turkish: "mod, yöntem", example: "Online mode of delivery makes education more accessible." },
    { word: "paradigm", definition: "a typical example or pattern", turkish: "paradigma, model", example: "Constructivist paradigms emphasize active knowledge construction." },
    { word: "phenomenon", definition: "a fact or situation that can be observed", turkish: "olgu, fenomen", example: "Student motivation is a complex psychological phenomenon." },
    { word: "priority", definition: "the most important thing to be done", turkish: "öncelik, önem sırası", example: "Student safety is the top priority in school policies." },
    { word: "prohibit", definition: "to formally forbid something", turkish: "yasaklamak, engellemek", example: "Academic integrity policies prohibit plagiarism and cheating." },
    { word: "publication", definition: "the act of publishing or a published work", turkish: "yayın, basım", example: "Peer-reviewed publications validate research quality." },
    { word: "quotation", definition: "words repeated from another source", turkish: "alıntı, fiyat teklifi", example: "Direct quotations require proper citation and quotation marks." },
    { word: "release", definition: "to set free or make available", turkish: "serbest bırakmak, yayınlamak", example: "Research findings are released after peer review." },
    { word: "reverse", definition: "to change to the opposite direction", turkish: "tersine çevirmek, ters", example: "Educational reforms aim to reverse declining test scores." },
    { word: "simulation", definition: "imitation of a real situation", turkish: "simülasyon, benzetim", example: "Computer simulations help students understand complex processes." },
    { word: "sole", definition: "only; single", turkish: "tek, yalnız", example: "Critical thinking is not the sole goal of education." },
    { word: "somewhat", definition: "to some extent", turkish: "biraz, bir ölçüde", example: "Student performance improved somewhat after the intervention." },
    { word: "submit", definition: "to present for consideration", turkish: "sunmak, teslim etmek", example: "Students must submit assignments by the specified deadline." },
    { word: "successor", definition: "someone who follows another in position", turkish: "halef, takipçi", example: "The new curriculum is a worthy successor to the previous version." },
    { word: "survive", definition: "to continue to live or exist", turkish: "hayatta kalmak, sürdürmek", example: "Only well-funded programs survive budget cuts." },
    { word: "thesis", definition: "a statement or theory put forward", turkish: "tez, iddia", example: "Graduate students defend their thesis before a committee." },
    { word: "topic", definition: "a subject of conversation or study", turkish: "konu, başlık", example: "Students choose research topics that interest them." },
    { word: "transmission", definition: "the process of sending or conveying", turkish: "iletim, aktarım", example: "Knowledge transmission occurs through various educational methods." },
    { word: "ultimate", definition: "being the best or most extreme example", turkish: "nihai, en son", example: "Student success is the ultimate goal of education." },
    { word: "unique", definition: "being the only one of its kind", turkish: "eşsiz, benzersiz", example: "Each student brings unique perspectives to classroom discussions." },
    { word: "visible", definition: "able to be seen", turkish: "görülebilir, belirgin", example: "Learning outcomes should be visible in student work." },
    { word: "voluntary", definition: "done willingly without being forced", turkish: "gönüllü, isteğe bağlı", example: "Voluntary participation ensures more authentic research results." }
  ],
  8: [
    { word: "abandon", definition: "to give up or leave behind", turkish: "terk etmek, bırakmak", example: "Students should not abandon their studies due to temporary setbacks." },
    { word: "accompany", definition: "to go with someone or happen at the same time", turkish: "eşlik etmek, beraberinde gelmek", example: "Visual aids should accompany oral presentations to enhance understanding." },
    { word: "accumulate", definition: "to gather or collect gradually", turkish: "biriktirmek, toplanmak", example: "Students accumulate knowledge and skills throughout their education." },
    { word: "ambiguous", definition: "having more than one possible meaning", turkish: "belirsiz, çok anlamlı", example: "Ambiguous test questions can confuse students and affect results." },
    { word: "append", definition: "to add something to the end", turkish: "eklemek, ilave etmek", example: "Students should append a bibliography to their research papers." },
    { word: "appreciate", definition: "to recognize the value or significance of something", turkish: "takdir etmek, değerlendirmek", example: "Students learn to appreciate diverse perspectives in literature." },
    { word: "arbitrary", definition: "based on random choice rather than reason", turkish: "keyfi, rastgele", example: "Grading should not be arbitrary but based on clear criteria." },
    { word: "automatically", definition: "without conscious thought or intervention", turkish: "otomatik olarak, kendiliğinden", example: "Experienced teachers automatically adjust their pace based on student needs." },
    { word: "bias", definition: "prejudice for or against something", turkish: "önyargı, yanlılık", example: "Researchers must control for potential bias in their studies." },
    { word: "chart", definition: "a visual display of information", turkish: "grafik, harita", example: "Progress charts help track student achievement over time." },
    { word: "clarify", definition: "to make something easier to understand", turkish: "açıklığa kavuşturmak, netleştirmek", example: "Teachers should clarify instructions before students begin assignments." },
    { word: "commodity", definition: "a useful or valuable thing", turkish: "mal, emtia", example: "Education has become a valuable commodity in the global economy." },
    { word: "complement", definition: "to complete or make perfect", turkish: "tamamlamak, bütünlemek", example: "Practical exercises complement theoretical learning effectively." },
    { word: "conform", definition: "to comply with rules or standards", turkish: "uymak, uygun davranmak", example: "Academic writing must conform to specific formatting guidelines." },
    { word: "contemporary", definition: "belonging to the present time", turkish: "çağdaş, günümüz", example: "Contemporary educational methods emphasize student-centered learning." },
    { word: "contradict", definition: "to assert the opposite of a statement", turkish: "çelişmek, karşı çıkmak", example: "New evidence may contradict previously accepted theories." },
    { word: "crucial", definition: "extremely important or necessary", turkish: "kritik, hayati", example: "Critical thinking skills are crucial for academic success." },
    { word: "currency", definition: "money; the state of being current", turkish: "para birimi, geçerlilik", example: "Research must maintain currency to remain relevant and useful." },
    { word: "denote", definition: "to indicate or refer to something", turkish: "göstermek, belirtmek", example: "Different symbols denote various mathematical operations." },
    { word: "detect", definition: "to discover or identify something", turkish: "tespit etmek, fark etmek", example: "Early assessment can detect learning difficulties in students." },
    { word: "deviate", definition: "to depart from an established course", turkish: "sapmak, ayrılmak", example: "Students should not deviate from the assignment guidelines." },
    { word: "displace", definition: "to move from the usual position", turkish: "yerinden etmek, değiştirmek", example: "Online learning has displaced some traditional classroom methods." },
    { word: "drama", definition: "a play for theater or emotional situation", turkish: "drama, tiyatro", example: "Educational drama helps students explore historical events." },
    { word: "eventual", definition: "happening at the end of a process", turkish: "nihai, sonunda olan", example: "Consistent study leads to eventual mastery of the subject." },
    { word: "exhibit", definition: "to display publicly", turkish: "sergilemek, göstermek", example: "Student artwork is exhibited in the university gallery." },
    { word: "exploit", definition: "to make use of; to treat unfairly", turkish: "faydalanmak, sömürmek", example: "Educational technology helps exploit new learning opportunities." },
    { word: "fluctuate", definition: "to rise and fall irregularly", turkish: "dalgalanmak, değişmek", example: "Student motivation levels fluctuate throughout the semester." },
    { word: "guidance", definition: "advice or information aimed at resolving problems", turkish: "rehberlik, yönlendirme", example: "Academic guidance helps students choose appropriate courses." },
    { word: "highlight", definition: "to emphasize or make prominent", turkish: "vurgulamak, öne çıkarmak", example: "Teachers highlight important concepts during lectures." },
    { word: "implicit", definition: "suggested without being directly expressed", turkish: "örtük, ima edilen", example: "Implicit learning occurs through exposure and practice." },
    { word: "induce", definition: "to bring about or cause", turkish: "neden olmak, uyarmak", example: "Positive reinforcement can induce better study habits." },
    { word: "inevitable", definition: "certain to happen; unavoidable", turkish: "kaçınılmaz, zorunlu", example: "Some mistakes are inevitable in the learning process." },
    { word: "infrastructure", definition: "basic physical systems of an organization", turkish: "altyapı, temel yapı", example: "Modern educational infrastructure includes digital technology." },
    { word: "inspect", definition: "to examine carefully", turkish: "denetlemek, incelemek", example: "Quality inspectors regularly inspect educational facilities." },
    { word: "intense", definition: "existing in a high degree", turkish: "yoğun, şiddetli", example: "Intensive study programs prepare students for challenging exams." },
    { word: "manipulate", definition: "to handle or control skillfully", turkish: "manipüle etmek, kullanmak", example: "Students learn to manipulate statistical software for data analysis." },
    { word: "minimize", definition: "to reduce to the smallest possible amount", turkish: "minimize etmek, azaltmak", example: "Good study strategies minimize wasted time and effort." },
    { word: "nuclear", definition: "relating to the nucleus of an atom", turkish: "çekirdek, nükleer", example: "Nuclear physics is a specialized field requiring advanced training." },
    { word: "offset", definition: "to counteract or compensate for", turkish: "dengelemek, karşılamak", example: "Additional study sessions offset gaps in understanding." },
    { word: "paragraph", definition: "a distinct section of writing", turkish: "paragraf, fıkra", example: "Each paragraph should focus on a single main idea." },
    { word: "plus", definition: "in addition to; a positive aspect", turkish: "artı, ek olarak", example: "Experience is a major plus when applying for graduate programs." },
    { word: "practitioner", definition: "someone who practices a profession", turkish: "uygulayıcı, praktisyen", example: "Educational practitioners implement research findings in classrooms." },
    { word: "predominant", definition: "present as the strongest element", turkish: "baskın, hakim", example: "Visual learning is the predominant style among art students." },
    { word: "prospect", definition: "the possibility of future success", turkish: "olasılık, beklenti", example: "Graduate education improves career prospects significantly." },
    { word: "radical", definition: "relating to fundamental change", turkish: "radikal, köklü", example: "Radical educational reforms require careful implementation." },
    { word: "random", definition: "without pattern or predetermined order", turkish: "rastgele, gelişigüzel", example: "Random sampling ensures representative research results." },
    { word: "reinforce", definition: "to strengthen or support", turkish: "pekiştirmek, güçlendirmek", example: "Practice exercises reinforce newly learned concepts." },
    { word: "restore", definition: "to bring back to original condition", turkish: "geri yüklemek, onarmak", example: "The goal is to restore students' confidence in mathematics." },
    { word: "revise", definition: "to reconsider and alter", turkish: "gözden geçirmek, düzeltmek", example: "Students should revise their essays before final submission." },
    { word: "schedule", definition: "a plan showing times of activities", turkish: "program, zamanlama", example: "A good study schedule helps manage time effectively." },
    { word: "tension", definition: "strain or stress between conflicting elements", turkish: "gerginlik, gerilim", example: "Creative tension can stimulate innovative thinking." },
    { word: "terminate", definition: "to bring to an end", turkish: "sonlandırmak, bitirmek", example: "Poor performance may terminate scholarship funding." },
    { word: "theme", definition: "a main subject or idea", turkish: "tema, konu", example: "Environmental sustainability is a recurring theme in modern curricula." },
    { word: "thereby", definition: "by that means; as a result", turkish: "böylece, bu sayede", example: "Students practice regularly, thereby improving their skills." },
    { word: "uniform", definition: "remaining the same in all cases", turkish: "üniforma, tek tip", example: "Uniform assessment criteria ensure fair evaluation." },
    { word: "vehicle", definition: "a means of carrying or transporting", turkish: "araç, vasıta", example: "Discussion forums serve as vehicles for peer learning." },
    { word: "via", definition: "by way of; through", turkish: "vasıtasıyla, yoluyla", example: "Students can access resources via the online library system." },
    { word: "virtual", definition: "existing in effect though not in reality", turkish: "sanal, gerçek gibi", example: "Virtual reality creates immersive learning experiences." },
    { word: "visual", definition: "relating to seeing or sight", turkish: "görsel, görme ile ilgili", example: "Visual learners benefit from diagrams and illustrations." },
    { word: "widespread", definition: "existing over a large area or among many people", turkish: "yaygın, geniş çaplı", example: "Digital literacy has become widespread among students." }
  ],
  9: [
    { word: "accommodate", definition: "to provide space for or adapt to", turkish: "uyum sağlamak, barındırmak", example: "Modern classrooms accommodate diverse learning styles." },
    { word: "analogy", definition: "a comparison between similar features", turkish: "benzetme, analoji", example: "Teachers use analogies to explain complex scientific concepts." },
    { word: "anticipate", definition: "to expect or predict something", turkish: "beklemek, önceden kestirmek", example: "Experienced educators anticipate common student difficulties." },
    { word: "assure", definition: "to tell someone confidently that something is true", turkish: "güvence vermek, sağlamak", example: "Quality assurance processes ensure educational standards are met." },
    { word: "attain", definition: "to succeed in achieving something", turkish: "ulaşmak, elde etmek", example: "Students work hard to attain their academic goals." },
    { word: "behalf", definition: "in the interests of someone", turkish: "adına, yararına", example: "The professor spoke on behalf of the research committee." },
    { word: "bulk", definition: "the largest part of something", turkish: "hacim, çoğunluk", example: "The bulk of research funding goes to science departments." },
    { word: "cease", definition: "to come to an end or stop", turkish: "durmak, son vermek", example: "Learning should never cease; it's a lifelong process." },
    { word: "coherent", definition: "logical and consistent", turkish: "tutarlı, bağdaşık", example: "Academic arguments must be coherent and well-structured." },
    { word: "coincide", definition: "to occur at the same time", turkish: "çakışmak, rastlamak", example: "The conference dates coincide with final exam period." },
    { word: "commence", definition: "to begin or start", turkish: "başlamak, başlatmak", example: "The academic year commences in September." },
    { word: "compatible", definition: "able to exist together without conflict", turkish: "uyumlu, bağdaşır", example: "New software must be compatible with existing systems." },
    { word: "concurrent", definition: "happening at the same time", turkish: "eş zamanlı, paralel", example: "Students take concurrent courses in multiple disciplines." },
    { word: "confine", definition: "to restrict within limits", turkish: "sınırlamak, hapsetmek", example: "Research should not be confined to laboratory settings." },
    { word: "controversy", definition: "prolonged public disagreement", turkish: "tartışma, çelişki", example: "Educational policy changes often generate public controversy." },
    { word: "conversely", definition: "in a way that is opposite", turkish: "tersine, aksine", example: "High motivation improves performance; conversely, low motivation hinders it." },
    { word: "device", definition: "a tool or piece of equipment", turkish: "cihaz, araç", example: "Mobile devices have transformed educational accessibility." },
    { word: "devote", definition: "to give time or attention to something", turkish: "adamak, ayırmak", example: "Successful students devote adequate time to studying." },
    { word: "diminish", definition: "to make or become less", turkish: "azalmak, küçülmek", example: "Effective teaching can diminish student anxiety about learning." },
    { word: "distort", definition: "to change something so it's no longer true", turkish: "çarpıtmak, bozmak", example: "Bias can distort research findings and conclusions." },
    { word: "duration", definition: "the length of time something lasts", turkish: "süre, devam", example: "The duration of the course is one academic semester." },
    { word: "erode", definition: "to gradually destroy or be destroyed", turkish: "aşındırmak, yıpratmak", example: "Poor teaching practices can erode student motivation." },
    { word: "ethical", definition: "relating to moral principles", turkish: "etik, ahlaki", example: "Ethical considerations guide all educational research." },
    { word: "format", definition: "the way something is arranged", turkish: "format, biçim", example: "Academic papers must follow specific formatting guidelines." },
    { word: "found", definition: "to establish or set up", turkish: "kurmak, tesis etmek", example: "The university was founded over a century ago." },
    { word: "inherent", definition: "existing as a natural part of something", turkish: "doğal, içsel", example: "Critical thinking is inherent in quality education." },
    { word: "insight", definition: "accurate understanding of something", turkish: "kavrayış, anlayış", example: "Field research provides valuable insights into real-world applications." },
    { word: "integral", definition: "essential to completeness", turkish: "bütünleyici, ayrılmaz", example: "Assessment is an integral part of the learning process." },
    { word: "intermediate", definition: "coming between two extremes", turkish: "orta, ara", example: "Intermediate level courses bridge basic and advanced studies." },
    { word: "manual", definition: "done by hand; a handbook", turkish: "el ile, kılavuz", example: "The laboratory manual provides step-by-step procedures." },
    { word: "mature", definition: "fully developed physically or mentally", turkish: "olgun, yetişkin", example: "Mature students often bring valuable life experience to classes." },
    { word: "mediate", definition: "to intervene between parties to help reach agreement", turkish: "arabuluculuk etmek, aracılık yapmak", example: "Teachers often mediate conflicts between students." },
    { word: "medium", definition: "in the middle; a means of communication", turkish: "orta, araç", example: "Digital media serve as effective educational mediums." },
    { word: "military", definition: "relating to armed forces", turkish: "askeri, askerlik", example: "Military history is studied in specialized academic programs." },
    { word: "minimal", definition: "of the smallest possible amount", turkish: "en az, minimal", example: "The intervention required minimal changes to existing procedures." },
    { word: "mutual", definition: "shared by two or more parties", turkish: "karşılıklı, ortak", example: "Mutual respect enhances teacher-student relationships." },
    { word: "norm", definition: "a standard or typical example", turkish: "norm, standart", example: "Collaborative learning has become the norm in modern education." },
    { word: "overlap", definition: "to cover partly by going over", turkish: "çakışmak, örtüşmek", example: "Course content often overlaps between related disciplines." },
    { word: "passive", definition: "accepting without resistance; not active", turkish: "pasif, edilgen", example: "Passive learning is less effective than active engagement." },
    { word: "portion", definition: "a part or share of something", turkish: "bölüm, parça", example: "A significant portion of class time is devoted to discussion." },
    { word: "preliminary", definition: "coming before the main event", turkish: "ön, başlangıç", example: "Preliminary results suggest the intervention was successful." },
    { word: "protocol", definition: "formal rules of behavior", turkish: "protokol, usul", example: "Research protocols ensure ethical standards are maintained." },
    { word: "qualitative", definition: "relating to quality rather than quantity", turkish: "nitel, kaliteli", example: "Qualitative research explores complex human experiences." },
    { word: "refine", definition: "to improve by making small changes", turkish: "geliştirmek, arıtmak", example: "Teachers refine their methods through ongoing professional development." },
    { word: "relax", definition: "to become less tense or strict", turkish: "rahatlamak, gevşetmek", example: "Meditation helps students relax before important exams." },
    { word: "restrain", definition: "to hold back or control", turkish: "kısıtlamak, zapt etmek", example: "Teachers must restrain their personal biases during instruction." },
    { word: "revolution", definition: "a dramatic and wide-reaching change", turkish: "devrim, değişim", example: "Digital technology has created a revolution in education." },
    { word: "rigid", definition: "unable to bend; strict", turkish: "katı, sert", example: "Rigid teaching methods don't accommodate individual differences." },
    { word: "route", definition: "a way or course taken", turkish: "yol, rota", example: "There are multiple routes to achieving educational success." },
    { word: "scenario", definition: "a possible sequence of events", turkish: "senaryo, durum", example: "Case study scenarios help students apply theoretical knowledge." },
    { word: "sphere", definition: "a round object; an area of activity", turkish: "küre, alan", example: "Education operates within the public sphere of society." },
    { word: "subordinate", definition: "lower in rank; less important", turkish: "astı, ikincil", example: "Practical skills should not be subordinate to theoretical knowledge." },
    { word: "supplement", definition: "something added to complete", turkish: "ek, tamamlayıcı", example: "Online resources supplement traditional textbook materials." },
    { word: "suspend", definition: "to temporarily stop or hang", turkish: "askıya almak, ertelemek", example: "The university may suspend students for academic misconduct." },
    { word: "team", definition: "a group working together", turkish: "takım, ekip", example: "Research teams combine diverse expertise for complex projects." },
    { word: "temporary", definition: "lasting for only a limited time", turkish: "geçici, kısa süreli", example: "Temporary setbacks should not discourage persistent students." },
    { word: "trigger", definition: "to cause something to happen", turkish: "tetiklemek, neden olmak", example: "Curiosity triggers deeper learning and exploration." },
    { word: "unify", definition: "to bring together as one", turkish: "birleştirmek, birlik sağlamak", example: "Interdisciplinary programs unify knowledge from multiple fields." },
    { word: "violate", definition: "to break a rule or law", turkish: "ihlal etmek, bozmak", example: "Plagiarism violates academic integrity policies." },
    { word: "vision", definition: "the ability to see; a mental image", turkish: "görüş, vizyon", example: "Educational leaders need a clear vision for institutional development." }
  ],
  10: [
    { word: "adjacent", definition: "next to or very near something", turkish: "bitişik, komşu", example: "The library is adjacent to the main academic building." },
    { word: "albeit", definition: "although; even though", turkish: "gerçi, her ne kadar", example: "The results were significant, albeit based on a small sample." },
    { word: "assembly", definition: "a gathering of people; putting together", turkish: "meclis, toplantı", example: "The faculty assembly voted on curriculum changes." },
    { word: "collapse", definition: "to fall down or fail suddenly", turkish: "çökmek, yıkılmak", example: "Without proper support, students' confidence can collapse." },
    { word: "colleague", definition: "a person you work with", turkish: "meslektaş, iş arkadaşı", example: "Professors collaborate closely with their research colleagues." },
    { word: "compile", definition: "to collect and combine information", turkish: "derlemek, toplamak", example: "Students compile research data for their final projects." },
    { word: "conceive", definition: "to form an idea; to become pregnant", turkish: "kavramak, tasarlamak", example: "Innovative educators conceive new teaching methodologies." },
    { word: "convince", definition: "to persuade someone to believe or do something", turkish: "ikna etmek, inandırmak", example: "Strong evidence convinces skeptics of research validity." },
    { word: "depress", definition: "to make sad or push down", turkish: "deprese etmek, bastırmak", example: "Poor grades can depress student motivation temporarily." },
    { word: "encounter", definition: "to meet or experience something", turkish: "karşılaşmak, rastlamak", example: "Students encounter diverse perspectives in multicultural classrooms." },
    { word: "enormous", definition: "extremely large", turkish: "büyük, muazzam", example: "Digital libraries provide enormous amounts of research material." },
    { word: "forthcoming", definition: "about to happen or appear", turkish: "yaklaşan, gelecek", example: "The forthcoming conference will feature leading researchers." },
    { word: "inclination", definition: "a tendency or preference", turkish: "eğilim, yatkınlık", example: "Some students have a natural inclination toward mathematical thinking." },
    { word: "integrity", definition: "honesty and moral uprightness", turkish: "dürüstlük, bütünlük", example: "Academic integrity is fundamental to scholarly work." },
    { word: "intrinsic", definition: "belonging naturally to something", turkish: "içsel, doğal", example: "Intrinsic motivation leads to deeper, more lasting learning." },
    { word: "invoke", definition: "to call upon or appeal to", turkish: "çağırmak, başvurmak", example: "Teachers invoke various strategies to engage different learners." },
    { word: "levy", definition: "to impose a tax or fee", turkish: "vergi koymak, toplamak", example: "The state may levy additional taxes to fund education." },
    { word: "likewise", definition: "in the same way; also", turkish: "aynı şekilde, benzer olarak", example: "Students must respect teachers; likewise, teachers should respect students." },
    { word: "nonetheless", definition: "in spite of what has been said", turkish: "yine de, buna rağmen", example: "The study had limitations; nonetheless, the findings were valuable." },
    { word: "notwithstanding", definition: "in spite of; nevertheless", turkish: "rağmen, karşın", example: "Notwithstanding budget cuts, the program maintained quality." },
    { word: "odd", definition: "strange; not even in number", turkish: "garip, tek sayı", example: "It seems odd that some students prefer difficult challenges." },
    { word: "ongoing", definition: "continuing; still in progress", turkish: "devam eden, süregelen", example: "Teacher professional development should be an ongoing process." },
    { word: "panel", definition: "a group of experts; a flat surface", turkish: "panel, kurul", example: "A panel of experts reviewed the research proposals." },
    { word: "persist", definition: "to continue firmly despite difficulties", turkish: "ısrar etmek, sürmek", example: "Successful students persist through academic challenges." },
    { word: "pose", definition: "to present or ask; to position", turkish: "duruş almak, soru sormak", example: "Complex problems pose significant challenges for researchers." },
    { word: "reluctance", definition: "unwillingness or hesitation", turkish: "isteksizlik, çekimserlik", example: "Student reluctance to participate may indicate anxiety." },
    { word: "so-called", definition: "used to express doubt about a name", turkish: "sözde, adı geçen", example: "The so-called digital divide affects educational equality." },
    { word: "straightforward", definition: "easy to understand; honest", turkish: "açık, basit", example: "Instructions should be straightforward and unambiguous." },
    { word: "undergo", definition: "to experience or be subjected to", turkish: "geçirmek, maruz kalmak", example: "All teachers undergo continuous professional development." },
    { word: "whereby", definition: "by which; according to which", turkish: "sayesinde, vasıtasıyla", example: "The system provides a mechanism whereby students can provide feedback." }
  ]
};

const LEITNER_BOXES = {
  1: { name: "Box 1 (Daily)", interval: 1, color: "bg-red-100 border-red-300" },
  2: { name: "Box 2 (2 Days)", interval: 2, color: "bg-orange-100 border-orange-300" },
  3: { name: "Box 3 (Weekly)", interval: 7, color: "bg-yellow-100 border-yellow-300" },
  4: { name: "Box 4 (Bi-weekly)", interval: 14, color: "bg-green-100 border-green-300" },
  5: { name: "Box 5 (Monthly)", interval: 30, color: "bg-blue-100 border-blue-300" }
};

// --- UI Components ---
const Card = ({ children, className = '' }) => <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`pb-4 mb-4 border-b border-gray-200 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h2 className={`text-xl font-bold text-gray-800 ${className}`}>{children}</h2>;
const CardContent = ({ children, className = '' }) => <div className={className}>{children}</div>;
const Button = ({ children, onClick, variant = 'default', className = '', ...props }) => {
    const baseStyles = "px-4 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2";
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
        secondary: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    };
    return <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
const Progress = ({ value, className = '' }) => (
    <div className={`h-4 bg-gray-200 rounded-full overflow-hidden ${className}`}>
        <div style={{ width: `${value}%` }} className="h-full bg-blue-500 rounded-full transition-all duration-300"></div>
    </div>
);

// --- Main App Component ---
export default function AWLVocabularyApp() {
  // Firebase State
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // App State
  const [currentView, setCurrentView] = useState('study');
  const [currentWord, setCurrentWord] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [wordData, setWordData] = useState({});
  const [stats, setStats] = useState({ totalStudied: 0, correct: 0, incorrect: 0, streak: 0 });
  const [studyQueue, setStudyQueue] = useState([]);
  const [selectedSublist, setSelectedSublist] = useState(1);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Gemini API State
  const [mnemonic, setMnemonic] = useState('');
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);
  const [mnemonicError, setMnemonicError] = useState('');

  const appId = typeof __app_id !== 'undefined' ? __app_id : 'awl-vocab-app';

  // --- Firebase Initialization Effect ---
  useEffect(() => {
    try {
      const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                 await signInWithCustomToken(firebaseAuth, __initial_auth_token);
            } else {
                 await signInAnonymously(firebaseAuth);
            }
        }
        setIsAuthReady(true);
      });
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      setIsLoading(false);
    }
  }, []);

  // --- Data Loading and Initialization ---
  const initializeUserDataInFirestore = useCallback(async (currentUserId) => {
    if (!db) return;
    const initialWordData = {};
    Object.keys(AWL_WORDS).forEach(sublist => {
      AWL_WORDS[sublist].forEach(wordObj => {
        initialWordData[wordObj.word] = {
          ...wordObj,
          sublist: parseInt(sublist),
          box: 1,
          lastReviewed: null,
          nextReview: new Date().toISOString(),
          userTurkishMeaning: '',
          attempts: 0,
          correct: 0,
          learned: false
        };
      });
    });
    const initialStats = { totalStudied: 0, correct: 0, incorrect: 0, streak: 0 };
    try {
      const wordDocRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'awlData', 'words');
      const statsDocRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'awlData', 'stats');
      await setDoc(wordDocRef, { data: initialWordData });
      await setDoc(statsDocRef, initialStats);
    } catch (error) {
      console.error("Error initializing user data in Firestore:", error);
    }
  }, [db, appId]);

  // --- Firestore Data Subscription Effect ---
  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;

    setIsLoading(true);
    const wordDocRef = doc(db, 'artifacts', appId, 'users', userId, 'awlData', 'words');
    const statsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'awlData', 'stats');

    const unsubscribeWords = onSnapshot(wordDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().data;
        // Data integrity check: ensure new words from code are added to user's data
        let needsUpdate = false;
        const allWords = Object.values(AWL_WORDS).flat();
        allWords.forEach(wordObj => {
            if (!data[wordObj.word]) {
                data[wordObj.word] = {
                    ...wordObj,
                    sublist: parseInt(Object.keys(AWL_WORDS).find(key => AWL_WORDS[key].some(w => w.word === wordObj.word))),
                    box: 1, lastReviewed: null, nextReview: new Date().toISOString(),
                    userTurkishMeaning: '', attempts: 0, correct: 0, learned: false
                };
                needsUpdate = true;
            }
        });
        
        setWordData(data);
        updateStudyQueue(data);
        if (needsUpdate) {
            setDoc(wordDocRef, { data });
        }
      } else {
        initializeUserDataInFirestore(userId);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to word data:", error);
      setIsLoading(false);
    });

    const unsubscribeStats = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data());
      }
    }, (error) => {
      console.error("Error listening to stats data:", error);
    });

    return () => {
      unsubscribeWords();
      unsubscribeStats();
    };
  }, [isAuthReady, db, userId, appId, initializeUserDataInFirestore]);

  const updateStudyQueue = (data) => {
    const now = new Date();
    const due = Object.values(data).filter(word => {
      if (!word.nextReview) return true;
      try { return new Date(word.nextReview) <= now; } catch { return false; }
    });
    due.sort((a,b) => a.box - b.box);
    setStudyQueue(due);
  };
  
  const getNextWord = () => {
    // Reset Gemini state
    setMnemonic('');
    setMnemonicError('');

    if (studyQueue.length > 0) {
      setCurrentWord(studyQueue[0]);
    } else {
      const unlearnedSublistWords = Object.values(wordData).filter(word => 
          word.sublist === selectedSublist && !word.learned
      );
      if(unlearnedSublistWords.length > 0) {
          setCurrentWord(unlearnedSublistWords[Math.floor(Math.random() * unlearnedSublistWords.length)]);
      } else {
          setCurrentWord(null);
      }
    }
    setShowAnswer(false);
    setUserAnswer('');
  };
  
  const generateMnemonic = async () => {
    if (!currentWord) return;
    setIsGeneratingMnemonic(true);
    setMnemonicError('');
    setMnemonic('');

    const prompt = `Create a simple and memorable mnemonic for the English word "${currentWord.word}" to help a Turkish speaker remember its meaning, which is "${currentWord.turkish}". The mnemonic can be in English or a mix of English and Turkish. Make it creative and easy to remember.`;

    try {
        const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
         if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            setMnemonic(result.candidates[0].content.parts[0].text);
        } else {
            throw new Error("Invalid response structure from API.");
        }
    } catch (error) {
        console.error("Error generating mnemonic:", error);
        setMnemonicError("Hatırlatıcı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
        setIsGeneratingMnemonic(false);
    }
  };

  const handleAnswer = async (correct) => {
    if (!currentWord || !db || !userId) return;
    const newWordData = { ...wordData };
    const word = newWordData[currentWord.word];
    const newStats = { ...stats };
    word.lastReviewed = new Date().toISOString();
    word.attempts += 1;
    newStats.totalStudied += 1;
    if (correct) {
      word.correct += 1;
      word.box = Math.min(word.box + 1, 5);
      newStats.correct += 1;
      newStats.streak += 1;
    } else {
      word.box = 1;
      newStats.incorrect += 1;
      newStats.streak = 0;
    }
    const interval = LEITNER_BOXES[word.box].interval;
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    word.nextReview = nextReviewDate.toISOString();
    word.learned = word.box === 5;
    setWordData(newWordData);
    setStats(newStats);
    try {
      const wordDocRef = doc(db, 'artifacts', appId, 'users', userId, 'awlData', 'words');
      const statsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'awlData', 'stats');
      await setDoc(wordDocRef, { data: newWordData });
      await setDoc(statsDocRef, newStats);
    } catch (error) { console.error("Error updating answer in Firestore:", error); }
    setTimeout(() => { getNextWord(); }, 1500);
  };

  const saveTurkishMeaning = async () => {
    if (!currentWord || !userAnswer.trim() || !db || !userId) return;
    const newWordData = { ...wordData };
    newWordData[currentWord.word].userTurkishMeaning = userAnswer.trim();
    setWordData(newWordData);
    try {
        const wordDocRef = doc(db, 'artifacts', appId, 'users', userId, 'awlData', 'words');
        await setDoc(wordDocRef, { data: newWordData });
    } catch(error) { console.error("Error saving Turkish meaning: ", error); }
    setShowAnswer(true);
  };
  
  const handleResetProgress = async () => {
    if (!db || !userId) return;
    setIsLoading(true);
    try {
      const wordDocRef = doc(db, 'artifacts', appId, 'users', userId, 'awlData', 'words');
      const statsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'awlData', 'stats');
      await deleteDoc(wordDocRef);
      await deleteDoc(statsDocRef);
    } catch(error) { console.error("Error resetting progress:", error); }
    setIsResetModalOpen(false);
    window.location.reload();
  };

  const getTotalWordCount = () => Object.keys(AWL_WORDS).reduce((total, sublist) => total + AWL_WORDS[sublist].length, 0);

  // --- Render Logic ---
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <Brain className="w-16 h-16 text-blue-500 mx-auto animate-pulse mb-4" />
                <p className="text-xl font-semibold text-gray-700">Loading your vocabulary workspace...</p>
            </div>
        </div>
    );
  }

  if (currentView === 'stats') {
    const boxStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    Object.values(wordData).forEach(word => {
      if (boxStats[word.box] !== undefined) { boxStats[word.box]++; }
    });
    const totalWords = getTotalWordCount();
    const learnedWords = Object.values(wordData).filter(w => w.learned).length;
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
          <Card>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="text-blue-600" /> İstatistikler
                </h1>
                <Button onClick={() => setCurrentView('study')} variant="outline">Çalışmaya Dön</Button>
            </div>
            {/* Stats Cards would go here */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Leitner Kutu Dağılımı</h3>
                <div className="space-y-3">
                    {Object.entries(LEITNER_BOXES).map(([box, info]) => (
                        <div key={box} className={`p-3 rounded-lg border ${info.color}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-sm md:text-base">{info.name}</span>
                                <span className="font-bold">{boxStats[box] || 0} kelime</span>
                            </div>
                            <Progress value={((boxStats[box] || 0) / totalWords) * 100} className="mt-2 h-2" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-center">
                <div className="text-lg mb-2">
                    <span className="font-semibold">Öğrenilen Kelimeler: </span>
                    <span className="text-green-600 font-bold">{learnedWords}/{totalWords}</span>
                </div>
                <Progress value={(learnedWords / totalWords) * 100} className="mb-4 h-3" />
                <Button onClick={() => setIsResetModalOpen(true)} variant="destructive">İlerlemeyi Sıfırla</Button>
            </div>
          </Card>
          {isResetModalOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <Card className="max-w-sm w-full">
                    <CardTitle className="text-center">Emin misiniz?</CardTitle>
                    <CardContent className="mt-4 text-center">
                        <p className="text-gray-600">Bu işlem tüm ilerlemenizi kalıcı olarak silecek ve geri alınamaz.</p>
                        <div className="flex gap-4 justify-center mt-6">
                            <Button onClick={() => setIsResetModalOpen(false)} variant="outline">İptal</Button>
                            <Button onClick={handleResetProgress} variant="destructive">Evet, Sıfırla</Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
          )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="text-blue-600" /> AWL Kelime Çalışması
                </h1>
                <Button onClick={() => setCurrentView('stats')} variant="outline" className="w-full sm:w-auto">
                    <BarChart3 className="w-4 h-4 mr-2" /> İstatistikler
                </Button>
            </div>
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <label className="font-semibold text-gray-700">Alt Liste:</label>
                        <select value={selectedSublist} onChange={(e) => setSelectedSublist(parseInt(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (<option key={num} value={num}>Sublist {num} ({AWL_WORDS[num]?.length || 0} kelime)</option>))}
                        </select>
                    </div>
                    <div className="text-sm font-medium text-gray-600 flex items-center gap-2 bg-white px-3 py-2 rounded-full border">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Çalışılacak: <span className="font-bold text-blue-600">{studyQueue.length}</span> kelime</span>
                    </div>
                </div>
                <Button onClick={getNextWord} className="w-full mt-4">{currentWord ? 'Sonraki Kelime' : 'Çalışmaya Başla'}</Button>
            </div>
            {currentWord ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-3xl font-bold text-blue-700 tracking-wide">{currentWord.word}</CardTitle>
                        <div className="text-center text-gray-500">{currentWord.definition}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Örnek Cümle:</p>
                            <p className="text-lg italic text-gray-800">"{currentWord.example}"</p>
                        </div>
                        {!showAnswer ? (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Bu kelimenin Türkçe anlamını yazın:</label>
                                <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Türkçe anlamı buraya yazın..." className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500" rows={3}/>
                                <Button onClick={saveTurkishMeaning} disabled={!userAnswer.trim()} className="w-full">Cevabı Kontrol Et</Button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="text-sm text-gray-600 mb-1">Verdiğiniz Cevap:</p>
                                    <p className="font-medium text-lg text-gray-800">{wordData[currentWord.word]?.userTurkishMeaning || userAnswer}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <p className="text-sm text-green-700 mb-1">Doğru Türkçe Anlamı:</p>
                                    <p className="font-medium text-lg text-green-800">{currentWord.turkish}</p>
                                </div>
                                <div className="text-center pt-4">
                                    <p className="mb-4 text-gray-700 font-semibold">Bu kelimeyi doğru bildiniz mi?</p>
                                    <div className="flex gap-4 justify-center">
                                        <Button onClick={() => handleAnswer(true)} className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="w-4 h-4" /> Evet</Button>
                                        <Button onClick={() => handleAnswer(false)} className="bg-red-600 hover:bg-red-700 text-white"><XCircle className="w-4 h-4" /> Hayır</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- Gemini AI Features --- */}
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-center text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2"><Sparkles className="text-purple-500" /> AI Öğrenme Aracı</h3>
                            <div className="flex justify-center">
                                <Button onClick={generateMnemonic} disabled={isGeneratingMnemonic} variant="secondary" className="flex-1 max-w-xs">
                                    {isGeneratingMnemonic ? <><Loader2 className="animate-spin mr-2"/> Oluşturuluyor...</> : '✨ Hatırlatıcı Oluştur'}
                                </Button>
                            </div>
                            {mnemonicError && <p className="text-red-500 text-sm mt-2 text-center">{mnemonicError}</p>}
                            {mnemonic && (
                                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg animate-fade-in">
                                    <h4 className="font-semibold text-purple-800">Hatırlatıcı (Mnemonic):</h4>
                                    <p className="italic text-purple-900 mt-1">{mnemonic}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-center text-xs text-gray-500 flex justify-around">
                            <span>Kutu: {currentWord.box}</span>
                            <span>Alt Liste: {currentWord.sublist}</span>
                            <span>Başarı: {wordData[currentWord.word]?.correct || 0}/{wordData[currentWord.word]?.attempts || 0}</span>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                 <Card>
                    <CardContent className="text-center py-12">
                        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Çalışmaya Hazır!</h3>
                        <p className="text-gray-500 mb-4 max-w-md mx-auto">
                            {studyQueue.length > 0
                                ? `Tekrar etmeniz gereken ${studyQueue.length} kelime var.`
                                : `Bugün için tekrar edilecek kelime yok. Yeni kelimeler öğrenmek için bir alt liste seçin.`}
                        </p>
                        <p className="text-sm text-blue-600 font-semibold">"Çalışmaya Başla" butonuna tıklayın.</p>
                    </CardContent>
                 </Card>
            )}
        </Card>
    </div>
  );
}
