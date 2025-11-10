import dotenv from "dotenv";
import connectDB from "../config/db";
import Question from "../models/Question";
import User from "../models/User";

dotenv.config();

const sampleQuestions = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: "Easy",
    topic: "Arrays",
    tags: ["Array", "Hash Table"],
    testCases: [
      {
        input: "[2,7,11,15], 9",
        expectedOutput: "[0,1]",
        isHidden: false,
      },
      {
        input: "[3,2,4], 6",
        expectedOutput: "[1,2]",
        isHidden: false,
      },
      {
        input: "[3,3], 6",
        expectedOutput: "[0,1]",
        isHidden: true,
      },
    ],
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    constraints:
      "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ],
    hints: ["Use a hash map to store complements"],
  },
  {
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: "Easy",
    topic: "Strings",
    tags: ["String", "Two Pointers"],
    testCases: [
      {
        input: '["h","e","l","l","o"]',
        expectedOutput: '["o","l","l","e","h"]',
        isHidden: false,
      },
      {
        input: '["H","a","n","n","a","h"]',
        expectedOutput: '["h","a","n","n","a","H"]',
        isHidden: false,
      },
    ],
    solution: `function reverseString(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
}`,
    constraints: "1 <= s.length <= 10^5",
  },
  {
    title: "Valid Palindrome",
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.`,
    difficulty: "Easy",
    topic: "Strings",
    tags: ["String", "Two Pointers"],
    testCases: [
      {
        input: '"A man, a plan, a canal: Panama"',
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: '"race a car"',
        expectedOutput: "false",
        isHidden: false,
      },
      {
        input: '" "',
        expectedOutput: "true",
        isHidden: true,
      },
    ],
    solution: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
    constraints: "1 <= s.length <= 2 * 10^5",
  },
  {
    title: "Maximum Subarray",
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    difficulty: "Medium",
    topic: "Dynamic Programming",
    tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
    testCases: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        expectedOutput: "6",
        isHidden: false,
      },
      {
        input: "[1]",
        expectedOutput: "1",
        isHidden: false,
      },
      {
        input: "[5,4,-1,7,8]",
        expectedOutput: "23",
        isHidden: true,
      },
    ],
    solution: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}`,
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    hints: ["Use Kadane's algorithm", "Keep track of current sum and max sum"],
  },
  {
    title: "Merge Two Sorted Lists",
    description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    difficulty: "Easy",
    topic: "Linked Lists",
    tags: ["Linked List", "Recursion"],
    testCases: [
      {
        input: "[1,2,4], [1,3,4]",
        expectedOutput: "[1,1,2,3,4,4]",
        isHidden: false,
      },
      {
        input: "[], []",
        expectedOutput: "[]",
        isHidden: false,
      },
      {
        input: "[], [0]",
        expectedOutput: "[0]",
        isHidden: true,
      },
    ],
    solution: `function mergeTwoLists(list1, list2) {
  const dummy = new ListNode(0);
  let current = dummy;
  
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }
  
  current.next = list1 || list2;
  return dummy.next;
}`,
    constraints: "The number of nodes in both lists is in the range [0, 50].",
  },
  {
    title: "Binary Search",
    description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
    difficulty: "Easy",
    topic: "Binary Search",
    tags: ["Array", "Binary Search"],
    testCases: [
      {
        input: "[-1,0,3,5,9,12], 9",
        expectedOutput: "4",
        isHidden: false,
      },
      {
        input: "[-1,0,3,5,9,12], 2",
        expectedOutput: "-1",
        isHidden: false,
      },
    ],
    solution: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}`,
    constraints: "1 <= nums.length <= 10^4",
  },
  {
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: "Easy",
    topic: "Stack",
    tags: ["String", "Stack"],
    testCases: [
      {
        input: '"()"',
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: '"()[]{}"',
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: '"(]"',
        expectedOutput: "false",
        isHidden: false,
      },
    ],
    solution: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  
  for (const char of s) {
    if (!map[char]) {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  
  return stack.length === 0;
}`,
    constraints: "1 <= s.length <= 10^4",
  },
  {
    title: "Climbing Stairs",
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    difficulty: "Easy",
    topic: "Dynamic Programming",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    testCases: [
      {
        input: "2",
        expectedOutput: "2",
        isHidden: false,
      },
      {
        input: "3",
        expectedOutput: "3",
        isHidden: false,
      },
      {
        input: "5",
        expectedOutput: "8",
        isHidden: true,
      },
    ],
    solution: `function climbStairs(n) {
  if (n <= 2) return n;
  
  let prev1 = 2, prev2 = 1;
  
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
}`,
    constraints: "1 <= n <= 45",
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    difficulty: "Easy",
    topic: "Arrays",
    tags: ["Array", "Dynamic Programming"],
    testCases: [
      {
        input: "[7,1,5,3,6,4]",
        expectedOutput: "5",
        isHidden: false,
      },
      {
        input: "[7,6,4,3,1]",
        expectedOutput: "0",
        isHidden: false,
      },
    ],
    solution: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  
  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  
  return maxProfit;
}`,
    constraints: "1 <= prices.length <= 10^5",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: `Given a string s, find the length of the longest substring without repeating characters.`,
    difficulty: "Medium",
    topic: "Strings",
    tags: ["String", "Hash Table", "Sliding Window"],
    testCases: [
      {
        input: '"abcabcbb"',
        expectedOutput: "3",
        isHidden: false,
      },
      {
        input: '"bbbbb"',
        expectedOutput: "1",
        isHidden: false,
      },
      {
        input: '"pwwkew"',
        expectedOutput: "3",
        isHidden: true,
      },
    ],
    solution: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0, left = 0;
  
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) {
      left = Math.max(left, map.get(s[right]) + 1);
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  
  return maxLen;
}`,
  },
];

const seedQuestions = async () => {
  try {
    await connectDB();

    // Find an admin user or create one
    let adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.log("⚠️  No admin user found. Creating one...");
      adminUser = await User.create({
        name: "Admin",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      });
      console.log("✅ Admin user created: admin@example.com / admin123");
    }

    // Delete existing questions
    await Question.deleteMany({});
    console.log("🗑️  Deleted existing questions");

    // Add admin user ID to questions
    const questionsWithUser = sampleQuestions.map((q) => ({
      ...q,
      createdBy: adminUser!._id,
    }));

    // Insert questions
    await Question.insertMany(questionsWithUser);
    console.log(
      `✅ Seeded ${questionsWithUser.length} questions successfully!`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding questions:", error);
    process.exit(1);
  }
};

seedQuestions();
