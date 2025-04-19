
export const MOCK_REPORTS =  [
    {
      id: "r1",
      type: "spam",
      content: {
        id: "p1",
        text: "Check out this amazing product! Click here to buy www.scam-link.com",
        author: {
          username: "user123",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 12,
        comments: 3,
      },
      reporter: { username: "gooduser1" },
      reason: "Spam advertising",
      createdAt: "10m ago",
      status: "pending"
    },
    {
      id: "r2",
      type: "inappropriate",
      content: {
        id: "p2",
        text: "This video shows how to make dangerous items, so cool!",
        media: [{ type: "video", thumbnail: "https://via.placeholder.com/100" }],
        author: {
          username: "riskypost",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 203,
        comments: 56,
      },
      reporter: { username: "safetyuser" },
      reason: "Dangerous content",
      createdAt: "32m ago",
      status: "under_review"
    },
    {
      id: "r3",
      type: "harassment",
      content: {
        id: "p3",
        text: "You are such a terrible person, I hate everything you post",
        author: {
          username: "angryuser",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 0,
        comments: 4,
      },
      reporter: { username: "victim001" },
      reason: "Personal attack",
      createdAt: "1h ago",
      status: "resolved"
    },
    {
      id: "r4",
      type: "deepfake",
      content: {
        id: "p4",
        text: "Look at this celebrity doing something crazy!",
        media: [{ type: "image", url: "https://via.placeholder.com/300" }],
        author: {
          username: "fakecreator",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 1205,
        comments: 432,
      },
      reporter: { username: "truthseeker" },
      reason: "AI-generated fake content of public figure",
      createdAt: "3h ago",
      status: "pending"
    },
    {
      id: "r5",
      type: "misinformation",
      content: {
        id: "p5",
        text: "BREAKING: Scientists confirm the Earth is actually flat! Government has been lying to us!",
        author: {
          username: "conspiracy_truth",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 342,
        comments: 198,
      },
      reporter: { username: "science_advocate" },
      reason: "Spreading dangerous misinformation",
      createdAt: "5h ago",
      status: "under_review"
    },
    {
      id: "r6",
      type: "copyright",
      content: {
        id: "p6",
        text: "Here's the full movie for free!",
        media: [{ type: "video", thumbnail: "https://via.placeholder.com/100" }],
        author: {
          username: "freemovies4u",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 987,
        comments: 145,
      },
      reporter: { username: "studio_legal" },
      reason: "Unauthorized sharing of copyrighted material",
      createdAt: "7h ago",
      status: "resolved"
    },
    {
      id: "r7",
      type: "other",
      content: {
        id: "p7",
        text: "I found a bug that lets you see private accounts! DM me for details",
        author: {
          username: "hackerman",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 27,
        comments: 15,
      },
      reporter: { username: "security_first" },
      reason: "Promoting exploitation of platform vulnerabilities",
      createdAt: "12h ago",
      status: "escalated"
    },
    {
      id: "r8",
      type: "spam",
      content: {
        id: "p8",
        text: "I made $5000 in one week using this method! Link in bio!",
        author: {
          username: "money_maker_101",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 45,
        comments: 32,
      },
      reporter: { username: "scam_detector" },
      reason: "Financial scam",
      createdAt: "1d ago",
      status: "pending"
    },
    {
      id: "r9",
      type: "inappropriate",
      content: {
        id: "p9",
        text: "Adults only! Check out my profile for exclusive content 😉",
        author: {
          username: "hotcontent22",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 89,
        comments: 37,
      },
      reporter: { username: "community_guardian" },
      reason: "Soliciting adult content on general platform",
      createdAt: "1d ago",
      status: "under_review"
    },
    {
      id: "r10",
      type: "harassment",
      content: {
        id: "p10",
        text: "@victim002 We all know where you live. Stop posting or else.",
        author: {
          username: "anonymous_threat",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 3,
        comments: 1,
      },
      reporter: { username: "victim002" },
      reason: "Threatening behavior",
      createdAt: "2d ago",
      status: "escalated"
    },
    {
      id: "r11",
      type: "deepfake",
      content: {
        id: "p11",
        text: "Famous politician caught saying this on hidden camera!",
        media: [{ type: "audio", duration: "1:24" }],
        author: {
          username: "political_exposes",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 2340,
        comments: 567,
      },
      reporter: { username: "fact_checker" },
      reason: "AI-generated voice clone",
      createdAt: "2d ago",
      status: "resolved"
    },
    {
      id: "r12",
      type: "misinformation",
      content: {
        id: "p12",
        text: "URGENT: New virus causes phones to explode! Share to warn others!",
        author: {
          username: "warning_network",
          avatarUrl: "https://via.placeholder.com/40",
        },
        likes: 4328,
        comments: 1205,
      },
      reporter: { username: "tech_journalist" },
      reason: "False information causing panic",
      createdAt: "3d ago",
      status: "resolved"
    }
  ];