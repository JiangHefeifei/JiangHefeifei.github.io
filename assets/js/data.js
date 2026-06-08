/* =========================================================================
   你的网站内容都在这里 —— 改内容主要改这个文件。
   规则：每条记录用 { } 包起来，多条之间用逗号分隔；文本里可写少量 HTML。
   <strong>...</strong> 会显示成金色（用来高亮你自己的名字 / 关键词）。
   ========================================================================= */

const SITE_DATA = {

  /* ---------------- 社交 / 联系方式 ---------------- */
  social: [
    { label: "Email",          href: "mailto:hjian105@ucr.edu",          icon: "email"   },
    { label: "GitHub",         href: "https://github.com/JiangHefeifei",  icon: "github"  },
    { label: "Google Scholar", href: "https://scholar.google.com/citations?user=Ul1tSO0AAAAJ&hl=en",                                 icon: "scholar" },
  ],

  /* ---------------- 引导页照片墙（先留空，给我图后填路径；顺序对应封面 6 个浮动位） ----------------
     例: "assets/img/p1.jpg"；null 显示占位框。横图/竖图都可以 */
  coverPhotos: [
    null, null, null, null, null, null,
  ],

  /* ---------------- News / 动态（最新的放最上面） ---------------- */
  news: [
    { date: "2026.05", html: 'Three papers — <strong>CoopLight</strong>, <strong>HiRe-MoMa</strong>, and a closed-loop human-following work — submitted to <strong>NeurIPS 2026</strong> / <strong>CoRL 2026</strong>.' },
    { date: "2026.04", html: 'Serving as <strong>Grader</strong> for <em>CS170: Introduction to Artificial Intelligence</em> at UC Riverside.' },
    { date: "2025.10", html: 'Joined the <strong>Trustworthy Autonomous Systems Laboratory (TASL)</strong>, advised by Prof. Jiachen Li.' },
    { date: "2025.09", html: 'Started my <strong>M.S. in Robotics</strong> at the University of California, Riverside.' },
  ],

  /* ---------------- Publications / 论文 ----------------
     group:   会变成小标题，把论文分组（同一组连续排列）
     authors: 用 <strong>你的名字</strong> 高亮自己；<sup>*</sup> 标共一
     year:    留空 "" 则不显示（在投论文用 award:"Under Review" 标注）
     summary: 一句话简介（可选）
     image:   论文插图 / teaser（如 "assets/img/cooplight.png"）。
              Selected 组若留 null 会显示左侧"Figure"占位框，填上路径即替换为真图 */
  publications: [
    /* —— 与申请最相关的在投工作 —— */
    {
      group: "Selected — Under Review",
      selected: true,
      title: "CoopLight: Cooperative Vision-Language Agents for Long-Tail Traffic Control",
      authors: 'Zehao Wang, <strong>Hefeifei Jiang</strong>, Siyan Li, Guoyuan Wu, Jiachen Li',
      venue: "Conference on Neural Information Processing Systems (NeurIPS) 2026",
      year: "",
      award: "Under Review",
      summary: "A vision-language framework where infrastructure- and vehicle-side agents reason over multi-view scenes and exchange semantic reports to control traffic signals and connected vehicles in safety-critical, long-tail scenarios.",
      image: "assets/pub_figure/cooplight.png",
      links: [
        { label: "Paper",   href: "#" },
        { label: "Code",    href: "#" },
        { label: "Project", href: "#" },
      ],
    },
    {
      group: "Selected — Under Review",
      selected: true,
      title: "Hierarchical Residual Policy Learning for Real-World Mobile Manipulation with Sparse Human Guidance",
      authors: 'Zhefei Gong, <strong>Hefeifei Jiang</strong>, Zehao Wang, Jiachen Li',
      venue: "Conference on Robot Learning (CoRL) 2026",
      year: "",
      award: "Under Review",
      summary: "HiRe-MoMa fine-tunes a frozen base policy via a hierarchical residual architecture and expert-guided value alignment, enabling stable, sample-efficient on-robot learning for mobile manipulation on a TIAGo++ with under 20% human guidance.",
      image: "assets/pub_figure/hiremoma.png",
      links: [
        { label: "Paper",   href: "#" },
        { label: "Code",    href: "#" },
        { label: "Project", href: "#" },
      ],
    },
    {
      group: "Selected — Under Review",
      selected: true,
      title: "Closed-Loop Customizable Human Following via Distilling Monotonic Constrained Policies",
      authors: 'Shiting Gong, Jianpeng Yao, Litian Gong, <strong>Hefeifei Jiang</strong>, Huaide Jiang, Jinfeng Wang, Zheyu Lin, Mingyu Ding, Jiachen Li',
      venue: "Conference on Robot Learning (CoRL) 2026",
      year: "",
      award: "Under Review",
      summary: "Distills constrained-RL guiding policies into a single preference-conditioned meta-policy, with a closed-loop adaptive mapping for test-time customizable human-following distance and lower collision rates.",
      image: "assets/pub_figure/human-following.png",
      links: [
        { label: "Paper",   href: "#" },
        { label: "Code",    href: "#" },
        { label: "Project", href: "#" },
      ],
    },
    /* —— 已发表 —— */
    {
      group: "Earlier Publications",
      title: "Extracting Fingerprint Features Using Autoencoder Networks for Gender Classification",
      authors: 'Y. Qi, M. Qiu, <strong>H. Jiang</strong>, F. Wang',
      venue: "Applied Sciences",
      year: "2022",
      award: "",
      summary: "",
      image: null,
      links: [{ label: "DOI", href: "https://doi.org/10.3390/app121910152" }],
    },
    {
      group: "Earlier Publications",
      title: "ConvLSTM Coupled Economics Indicators Quantitative Trading Decision Model",
      authors: 'Y. Qi, <strong>H. Jiang</strong>, S. Li, J. Cao',
      venue: "Symmetry",
      year: "2022",
      award: "",
      summary: "",
      image: null,
      links: [],
    },
    /* —— 专利 —— */
    {
      group: "Patents",
      title: "AIOT Digital Twin Intelligent Substation Cloud-based Analysis Platform",
      authors: 'Y. Qi, <strong>H. Jiang</strong>, X. Jin, J. Ma, M. Zhao, et al.',
      venue: "Patent",
      year: "",
      award: "",
      summary: "",
      image: null,
      links: [],
    },
    {
      group: "Patents",
      title: "A Method and Apparatus for Matching a Three-dimensional Model of the Sacrum Based on Deep Learning",
      authors: 'Y. Qi, <strong>H. Jiang</strong>, F. Wang, J. Yang',
      venue: "Patent",
      year: "",
      award: "",
      summary: "",
      image: null,
      links: [],
    },
  ],

  /* ---------------- Projects / 研究经历 ---------------- */
  projects: [
    {
      title: "Quantum Neural Networks for Multimodal Representation Learning",
      image: null,
      description: "Replaced the CLIP image encoder with a Quantum Neural Network to compress large multimodal models while preserving representation quality. Remote intern with Prof. Juan Zhuang.",
      tags: ["QNN", "CLIP", "Multimodal"],
      links: [],
    },
    {
      title: "Automated Annotation of Sacrum Bones",
      image: null,
      description: "Semi-automatic medical-image labeling pipeline (OpenCV contour extraction + Hounsfield-Unit preservation) to build high-quality sacrum segmentation datasets, with Xi'an Honghui Hospital.",
      tags: ["Medical Imaging", "OpenCV", "Segmentation"],
      links: [],
    },
    {
      title: "Smart Greenhouse Monitoring Robot (NUS Workshop)",
      image: null,
      description: "Led a multi-sensor greenhouse system on Raspberry Pi / ESP32 with a real-time web app; YOLOv8 plant counting and a ResNet pest classifier. Supervised by Prof. Tan Wee Kek.",
      tags: ["Robotics / IoT", "YOLOv8", "Full-stack"],
      links: [],
    },
    {
      title: "Digital-Twin Substation Inspection Robot",
      image: null,
      description: "Built a tracked inspection robot with SLAM mapping and a YOLOv3 recognition module for real-time substation monitoring; deployed across multiple substations.",
      tags: ["SLAM", "Robotics", "YOLOv3"],
      links: [],
    },
  ],

  /* ---------------- Teaching / 教学 ---------------- */
  teaching: [
    { term: "2026 Spring", course: "CS170: Introduction to Artificial Intelligence", role: "Grader", description: "Graded assignments and exams for the undergraduate AI course at UC Riverside." },
  ],

  /* ---------------- Honors & Awards / 获奖（最新在前；已精选 CV 中较有分量的） ---------------- */
  awards: [
    { date: "2024.06", html: '<strong>“Zhi Cheng Zhi Bo” All-Round Excellence Scholarship</strong> — Top 10, university-level' },
    { date: "2024.04", html: '<strong>Zhou Lian Scholarship</strong> — Top 10 (#1 by points), university-level' },
    { date: "2022.02", html: '<strong>Meritorious Award</strong> — Mathematical Contest in Modeling (MCM), USA' },
    { date: "2021.11", html: '<strong>Provincial-Level Approval</strong> — China College Student Innovation &amp; Entrepreneurship Project' },
    { date: "2021.10", html: '<strong>1st Prize</strong> — 23rd National Robot Championship &amp; 12th International Humanoid Robot Olympics' },
    { date: "2021.04", html: '<strong>Honorable Mention</strong> — ICPC Asia East-Continent Final' },
    { date: "2020.08", html: '<strong>Gold Medal</strong> — International Festival of Science and Technology, Tunisia' },
  ],
};

// 关键：顶层 const 不会自动挂到 window 上，这里显式暴露给 main.js 使用
window.SITE_DATA = SITE_DATA;
