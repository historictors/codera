const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
require('dotenv').config();

const sampleProblems = [
  {
    title: "Two Sum",
    slug: "two-sum",
    description: "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p><p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.</p><p>You can return the answer in any order.</p>",
    difficulty: "Easy",
    category: "Array",
    tags: ["Array", "Hash Table"],
    examples: [ {
    input: "4\n2 7 11 15\n9",
    output: "0 1",
    explanation: "Indices of numbers 2 and 7 which sum to 9."
  },
  {
    input: "3\n3 2 4\n6",
    output: "1 2",
    explanation: "Indices of numbers 2 and 4 which sum to 6."
  }],
    constraints: [],
   testCases: [
  {
    input: "4\n2 7 11 15\n9",
    expectedOutput: "0 1",
    isHidden: false
  },
  {
    input: "3\n3 2 4\n6",
    expectedOutput: "1 2",
    isHidden: false
  },
  {
    input: "2\n3 3\n6",
    expectedOutput: "0 1",
    isHidden: true
  }
]
,
    starterCode: {
  cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}

int main() {
    int n, target;
    cin >> n;
    vector<int> nums(n);
    for(int i = 0; i < n; i++) cin >> nums[i];
    cin >> target;
    return 0;
}`,
  python: `def two_sum(nums, target):
    # Your code here
    return []

if __name__ == "__main__":
    n = int(input())
    nums = list(map(int, input().split()))
    target = int(input())
    print(*two_sum(nums, target))`,
  java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }

    public static void main(String[] args) {
       
    }
}`,
  javascript: `function twoSum(nums, target) {
    // Your code here
    return [];
}

const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
let input = [];
rl.on("line", (line) => input.push(line));
rl.on("close", () => {
    
});`
}

  },
  {
    title: "Reverse String",
    slug: "reverse-string",
    description: "<p>Write a function that reverses a string. The input string is given as a single line of characters <code>s</code>.</p><p>Return the reversed string.</p>",
    difficulty: "Easy",
    category: "String",
    tags: ["String", "Two Pointers"],
    examples: [
  {
    input: "hello",
    output: "olleh",
    explanation: "Simple reversal"
  },
  {
    input: "OpenAI",
    output: "IAnepO",
    explanation: "Case-sensitive reverse"
  }
],

    constraints: [],
    testCases: [
      { input: "hello", expectedOutput: "olleh", isHidden: false },
      { input: "Hannah", expectedOutput: "hannaH", isHidden: false }
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    reverse(s.begin(), s.end());
    cout << s;
    return 0;
}`,
      python: `s = input()
print(s[::-1])`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(new StringBuilder(s).reverse().toString());
    }
}`,
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
    console.log(line.split("").reverse().join(""));
    rl.close();
});`
    }
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    description: "<p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p><p>An input string is valid if: open brackets must be closed by the same type of brackets, and in the correct order.</p>",
    difficulty: "Easy",
    category: "Stack",
    tags: ["String", "Stack"],
    examples: [
  {
    input: "()",
    output: "true",
    explanation: "The string contains a single valid pair of parentheses."
  },
  {
    input: "()[]{}",
    output: "true",
    explanation: "All pairs of brackets are balanced and properly nested."
  },
  {
    input: "(]",
    output: "false",
    explanation: "Mismatched brackets: '(' is not closed by ')'."
  }
]
,
    constraints: [],
    testCases: [
      { input: "()", expectedOutput: "true", isHidden: false },
      { input: "()[]{}", expectedOutput: "true", isHidden: false },
      { input: "(]", expectedOutput: "false", isHidden: true }
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <stack>
using namespace std;

bool isValid(string s) {
    // Your code here
    return false;
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false");
    return 0;
}`,
      python: `def is_valid(s):
    # Your code here
    return False

if __name__ == "__main__":
    s = input()
    print("true" if is_valid(s) else "false")`,
      java: `import java.util.*;
public class Main {
    public static boolean isValid(String s) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(isValid(s) ? "true" : "false");
    }
}`,
      javascript: `function isValid(s) {
    // Your code here
    return false;
}
const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
    console.log(isValid(line) ? "true" : "false");
    rl.close();
});`
    }
  },
  {
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    description: "<p>Given two sorted arrays, merge them into one sorted array and return the result.</p>",
    difficulty: "Easy",
    category: "Linked List",
    tags: ["Linked List", "Recursion"],
   examples: [
  {
    input: "1 2 4\n1 3 4",
    output: "1 1 2 3 4 4",
    explanation: "Merges and sorts both arrays into one sorted list."
  },
  {
    input: "\n",
    output: "",
    explanation: "Both lists are empty, so the result is an empty list."
  },
  {
    input: "\n0",
    output: "0",
    explanation: "First list is empty, second contains one element."
  }
]
,
    constraints: [],
    testCases: [
      { input: "1 2 4\n1 3 4", expectedOutput: "1 1 2 3 4 4", isHidden: false },
      { input: "\n", expectedOutput: "", isHidden: false },
      { input: "\n0", expectedOutput: "0", isHidden: true }
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    vector<int> nums;
    int x;
    istringstream iss1(line1), iss2(line2);
    while (iss1 >> x) nums.push_back(x);
    while (iss2 >> x) nums.push_back(x);
    sort(nums.begin(), nums.end());
    for (int n : nums) cout << n << " ";
    return 0;
}`,
      python: `import sys
nums = []
for line in sys.stdin:
    if line.strip():
        nums += list(map(int, line.strip().split()))
nums.sort()
print(*nums)`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> nums = new ArrayList<>();
        while (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            if (!line.isEmpty()) {
                for (String s : line.split(" ")) nums.add(Integer.parseInt(s));
            }
        }
        Collections.sort(nums);
        for (int num : nums) System.out.print(num + " ");
    }
}`,
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
let nums = [];
rl.on("line", (line) => {
    if (line.trim()) nums.push(...line.split(" ").map(Number));
});
rl.on("close", () => {
    nums.sort((a, b) => a - b);
    console.log(nums.join(" "));
});`
    }
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    description: "<p>Find the contiguous subarray with the largest sum.</p>",
    difficulty: "Medium",
    category: "Dynamic Programming",
    tags: ["Array", "DP"],
    examples: [
  {
    input: "-2 1 -3 4 -1 2 1 -5 4",
    output: "6",
    explanation: "Subarray [4, -1, 2, 1] has the maximum sum of 6."
  },
  {
    input: "1",
    output: "1",
    explanation: "Single element is the maximum subarray."
  },
  {
    input: "5 4 -1 7 8",
    output: "23",
    explanation: "Whole array is the maximum subarray."
  }
]
,
    constraints: [],
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: false },
      { input: "5 4 -1 7 8", expectedOutput: "23", isHidden: true }
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Your code here
    return 0;
}

int main() {
    vector<int> nums;
    int x;
    while (cin >> x) nums.push_back(x);
    cout << maxSubArray(nums);
    return 0;
}`,
      python: `def max_sub_array(nums):
    # Your code here
    return 0

if __name__ == "__main__":
    nums = list(map(int, input().split()))
    print(max_sub_array(nums))`,
      java: `import java.util.*;
public class Main {
    public static int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
        System.out.println(maxSubArray(nums));
    }
}`,
      javascript: `function maxSubArray(nums) {
    // Your code here
    return 0;
}
const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
    const nums = line.split(" ").map(Number);
    console.log(maxSubArray(nums));
    rl.close();
});`
    }
  }
];


const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codera');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Problem.deleteMany({});
    await Contest.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@codera.com',
      password: 'admin123',
      stats: {
        totalSolved: 5,
        easySolved: 3,
        mediumSolved: 2,
        hardSolved: 0,
        arenaWins: 10,
        arenaLosses: 3,
        totalSubmissions: 15,
        rating: 1500
      }
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create sample problems
    for (const problemData of sampleProblems) {
      const problem = new Problem({
        ...problemData,
        author: adminUser._id
      });
      await problem.save();
      console.log(`Created problem: ${problem.title}`);
    }

    // Create sample users
    const users = [
      {
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
        stats: {
          totalSolved: 25,
          easySolved: 15,
          mediumSolved: 8,
          hardSolved: 2,
          arenaWins: 15,
          arenaLosses: 7,
          totalSubmissions: 45,
          rating: 1650
        }
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: 'password123',
        stats: {
          totalSolved: 18,
          easySolved: 12,
          mediumSolved: 5,
          hardSolved: 1,
          arenaWins: 8,
          arenaLosses: 12,
          totalSubmissions: 32,
          rating: 1350
        }
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        password: 'password123',
        stats: {
          totalSolved: 42,
          easySolved: 20,
          mediumSolved: 18,
          hardSolved: 4,
          arenaWins: 25,
          arenaLosses: 8,
          totalSubmissions: 68,
          rating: 1800
        }
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.username}`);
    }

    // Create sample contest
    const contest = new Contest({
      title: 'Weekly Coding Challenge',
      description: 'Test your skills with this weekly programming contest featuring algorithm and data structure problems.',
      creator: adminUser._id,
      problems: [
        { problem: await Problem.findOne({ slug: 'two-sum' }), points: 100, order: 1 },
        { problem: await Problem.findOne({ slug: 'valid-parentheses' }), points: 150, order: 2 }
      ].filter(p => p.problem),
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
      duration: 60,
      settings: {
        isPublic: true,
        showLeaderboard: true,
        maxParticipants: 100
      }
    });
    await contest.save();
    console.log('Created sample contest');

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
