interface UdemyCourse {
  id: number;
  title: string;
  url: string;
  description: string;
  image_480x270: string;
  price: string;
  price_detail: {
    amount: number;
    currency: string;
  };
  rating?: number;
  num_reviews?: number;
  instructor?: string;
}

// Function to search courses via Udemy API
export const searchUdemyCourses = async (query: string): Promise<UdemyCourse[]> => {
  try {
    // If we're in development or don't have API keys configured,
    // fallback to our local mock data
    if (process.env.NODE_ENV === 'development' || !process.env.UDEMY_CLIENT_ID) {
      return searchMockCourses(query);
    }
    
    // This is where we would normally call the real Udemy API
    // Example:
    // const response = await fetch(`https://www.udemy.com/api-2.0/courses/?search=${encodeURIComponent(query)}`, {
    //   headers: {
    //     "Accept": "application/json, text/plain, */*",
    //     "Authorization": `Basic ${btoa(`${process.env.UDEMY_CLIENT_ID}:${process.env.UDEMY_CLIENT_SECRET}`)}`
    //   }
    // });
    // const data = await response.json();
    // return data.results;
    
    // But for now, we'll use our enhanced mock data
    return searchMockCourses(query);
  } catch (error) {
    console.error("Error searching Udemy courses:", error);
    return [];
  }
};

// Enhanced mock course search with improved matching logic
export const searchMockCourses = (query: string): UdemyCourse[] => {
  if (!query.trim()) return ALL_COURSES;
  
  // Normalize the search query (remove extra spaces, lowercase)
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
  const searchTerms = normalizedQuery.split(/\s+/);
  
  console.log(`Searching for: "${normalizedQuery}" with terms:`, searchTerms);
  
  // First, try to find exact title matches (case insensitive)
  const exactMatches = ALL_COURSES.filter(course => {
    const normalizedTitle = course.title.toLowerCase().trim().replace(/\s+/g, ' ');
    return normalizedTitle === normalizedQuery || 
           normalizedTitle.includes(normalizedQuery);
  });
  
  if (exactMatches.length > 0) {
    console.log(`Found ${exactMatches.length} exact matches`);
    return exactMatches;
  }
  
  // Then, try keyword matching with a scoring system
  const scoredCourses = ALL_COURSES.map(course => {
    const normalizedTitle = course.title.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedDesc = course.description.toLowerCase().trim().replace(/\s+/g, ' ');
    
    let score = 0;
    
    // Check if all search terms are in the title or description
    let allTermsInTitle = true;
    let allTermsInDesc = true;
    
    // Score each search term
    searchTerms.forEach(term => {
      if (term.length < 3) return; // Skip very short terms
      
      if (!normalizedTitle.includes(term)) {
        allTermsInTitle = false;
      }
      
      if (!normalizedDesc.includes(term)) {
        allTermsInDesc = false;
      }
      
      // Title matches are weighted higher
      if (normalizedTitle.includes(term)) {
        score += 10;
        
        // Bonus points for word boundaries
        if (new RegExp(`\\b${term}\\b`).test(normalizedTitle)) {
          score += 5;
        }
      }
      
      // Description matches
      if (normalizedDesc.includes(term)) {
        score += 3;
        
        // Bonus for word boundaries in description
        if (new RegExp(`\\b${term}\\b`).test(normalizedDesc)) {
          score += 2;
        }
      }
    });
    
    // Bonus for having all terms in title or description
    if (allTermsInTitle) score += 20;
    if (allTermsInDesc) score += 10;
    
    return { course, score };
  });
  
  // Filter out courses with no match and sort by score
  const results = scoredCourses
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.course);
  
  console.log(`Found ${results.length} results after scoring`);
  return results;
};

// Add the new Graphic Design course to our mock data
export const ALL_COURSES: UdemyCourse[] = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp 2024",
    url: "https://www.udemy.com/course/web-development-bootcamp/",
    description: "Become a full-stack web developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB, Web3 and more!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/1565838_e54e_16.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    },
    rating: 4.7,
    num_reviews: 157832,
    instructor: "Dr. Angela Yu"
  },
  {
    id: 2,
    title: "Machine Learning A-Z: AI, Python & R + ChatGPT",
    url: "https://www.udemy.com/course/machinelearning/",
    description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts. Code templates included.",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/950390_270f_3.jpg",
    price: "$84.99",
    price_detail: {
      amount: 84.99,
      currency: "USD"
    },
    rating: 4.5,
    num_reviews: 125463,
    instructor: "Kirill Eremenko"
  },
  {
    id: 3,
    title: "The Complete JavaScript Course 2024: From Zero to Expert!",
    url: "https://www.udemy.com/course/the-complete-javascript-course/",
    description: "The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory. Many courses in one!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/851712_fc61_6.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    },
    rating: 4.8,
    num_reviews: 145926,
    instructor: "Jonas Schmedtmann"
  },
  {
    id: 4,
    title: "React - The Complete Guide 2024 (incl. React Router & Redux)",
    url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
    description: "Dive in and learn React.js from scratch! Learn Reactjs, Redux, React Routing, Animations, Next.js and more!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/1362070_b9a1_2.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    },
    rating: 4.6,
    num_reviews: 162088,
    instructor: "Maximilian Schwarzmüller"
  },
  {
    id: 5,
    title: "Python for Data Science and Machine Learning Bootcamp",
    url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
    description: "Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, and more!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/903744_8eb2.jpg",
    price: "$89.99",
    price_detail: {
      amount: 89.99,
      currency: "USD"
    },
    rating: 4.6,
    num_reviews: 108253,
    instructor: "Jose Portilla"
  },
  {
    id: 6,
    title: "The Complete Digital Marketing Course - 12 Courses in 1",
    url: "https://www.udemy.com/course/the-complete-digital-marketing-course/",
    description: "Master Digital Marketing Strategy, Social Media Marketing, SEO, YouTube, Email, Facebook Marketing, Analytics & More!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/914296_3670_8.jpg",
    price: "$84.99",
    price_detail: {
      amount: 84.99,
      currency: "USD"
    },
    rating: 4.5,
    num_reviews: 92475,
    instructor: "Rob Percival"
  },
  {
    id: 7,
    title: "The Data Science Course 2024: Complete Data Science Bootcamp",
    url: "https://www.udemy.com/course/the-data-science-course-complete-data-science-bootcamp/",
    description: "Complete Data Science Training: Mathematics, Statistics, Python, Advanced Statistics in Python, Machine & Deep Learning",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/1754098_e0df_3.jpg",
    price: "$84.99",
    price_detail: {
      amount: 84.99,
      currency: "USD"
    },
    rating: 4.6,
    num_reviews: 65841,
    instructor: "365 Careers"
  },
  {
    id: 8,
    title: "AWS Certified Solutions Architect - Associate 2024",
    url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
    description: "Want to pass the AWS Solutions Architect Associate Exam? Want to become Amazon Web Services Certified? Do this course!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/362328_91f3_10.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    },
    rating: 4.7,
    num_reviews: 87962,
    instructor: "Stephane Maarek"
  },
  {
    id: 9,
    title: "The Complete Cyber Security Course: Hackers Exposed!",
    url: "https://www.udemy.com/course/the-complete-internet-security-privacy-course-volume-1/",
    description: "Volume 1: Become a Cyber Security Specialist, Defeat Hackers and Network Engineer with Practical Cyber Security Skills!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/614772_233b_9.jpg",
    price: "$74.99",
    price_detail: {
      amount: 74.99,
      currency: "USD"
    },
    rating: 4.5,
    num_reviews: 54791,
    instructor: "Nathan House"
  },
  {
    id: 10,
    title: "iOS & Swift - The Complete iOS App Development Bootcamp",
    url: "https://www.udemy.com/course/ios-13-app-development-bootcamp/",
    description: "From Beginner to iOS App Developer with Just One Course! Fully Updated with Complete Modules on SwiftUI and Telegram Clones!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/1778502_f4b9_12.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    },
    rating: 4.8,
    num_reviews: 78532,
    instructor: "Dr. Angela Yu"
  },
  {
    id: 11,
    title: "Angular - The Complete Guide (2024 Edition)",
    url: "https://www.udemy.com/course/the-complete-guide-to-angular-2/",
    description: "Master Angular (formerly \"Angular 2\") and build awesome, reactive web apps with the successor of Angular.js",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/756150_c033_2.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    },
    rating: 4.6,
    num_reviews: 132408,
    instructor: "Maximilian Schwarzmüller"
  },
  {
    id: 12,
    title: "Microsoft Excel - Excel from Beginner to Advanced",
    url: "https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/",
    description: "Excel with this A-Z Microsoft Excel Course. Microsoft Excel 2010, 2013, 2016, Excel 2019, Office 365",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/793796_0e89_2.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    },
    rating: 4.6,
    num_reviews: 123456,
    instructor: "Kyle Pew"
  },
  {
    id: 13,
    title: "100 Days of Code: The Complete Python Pro Bootcamp",
    url: "https://www.udemy.com/course/100-days-of-code/",
    description: "Master Python by building 100 projects in 100 days. Learn data science, automation, build websites, games and apps!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/2776760_f176_10.jpg",
    price: "$89.99",
    price_detail: {
      amount: 89.99,
      currency: "USD"
    },
    rating: 4.7,
    num_reviews: 137482,
    instructor: "Dr. Angela Yu"
  },
  {
    id: 14,
    title: "Graphic Design Masterclass - Learn GREAT Design",
    url: "https://www.udemy.com/course/graphic-design-masterclass-learn-great-design/",
    description: "The Ultimate Graphic Design Course Which Covers Photoshop, Illustrator, InDesign, Design Theory, Branding and Logo Design",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/1643044_e281_5.jpg",
    price: "$84.99",
    price_detail: {
      amount: 84.99,
      currency: "USD"
    },
    rating: 4.7,
    num_reviews: 24581,
    instructor: "Lindsay Marsh"
  }
];
