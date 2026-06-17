export const MAIN_OPTIONS = [
  {
    id: 'wrong-answer',
    icon: 'x',
    iconBg: 'rgba(220,38,38,0.1)',
    iconColor: '#DC2626',
    title: 'Wrong answer',
    subtitle: "The marked answer doesn't seem right",
    screenKey: '2A'
  },
  {
    id: 'cant-see',
    icon: 'eye',
    iconBg: 'rgba(37,99,235,0.1)',
    iconColor: '#2563EB',
    title: "Can't see something",
    subtitle: 'Image, text, or explanation is missing or broken',
    screenKey: '2B'
  },
  {
    id: 'need-help',
    icon: '!',
    iconBg: 'rgba(22,163,74,0.1)',
    iconColor: '#16A34A',
    title: 'Need help',
    subtitle: 'I want this question or answer explained',
    screenKey: '2C'
  },
  {
    id: 'not-right-q',
    icon: '!',
    iconBg: 'rgba(234,88,12,0.1)',
    iconColor: '#EA580C',
    title: 'Not the right question',
    subtitle: 'Repeated, wrong subject, wrong language, or wrong content',
    screenKey: '2D'
  }
]

export const SUB_OPTIONS = {
  '2A': {
    header: 'What exactly feels wrong?',
    category: 'Wrong Answer',
    options: [
      { id: 'marked-wrong', label: 'The marked answer is wrong', prompt: 'The answer should be option B because...' },
      { id: 'exp-mismatch', label: "The explanation doesn't match the answer", prompt: 'The explanation says ___ but the answer is ___...' },
      { id: 'multi-correct', label: 'More than one option seems correct', prompt: 'Which options seem correct to you?' },
      { id: 'incomplete', label: 'The question is incomplete or unclear', prompt: "What's missing or confusing?" },
      { id: 'book-different', label: 'My book or class says something different', prompt: 'Which book or source are you referring to?' }
    ]
  },
  '2B': {
    header: "What's missing or broken?",
    category: "Can't See Something",
    options: [
      { id: 'image-missing', label: 'Question image is not showing', prompt: 'Which image - question, options, or explanation?' },
      { id: 'text-garbled', label: 'Option text is missing or garbled', prompt: 'Which option number is affected?' },
      { id: 'formula-broken', label: 'Explanation, table, or formula is broken', prompt: "What's broken - table, formula, or diagram?" },
      { id: 'image-wrong', label: "Image is showing but it's wrong or unclear", prompt: 'What seems wrong or unclear about the image?' }
    ]
  },
  '2C': {
    header: 'What kind of help do you need?',
    category: 'Need Help',
    options: [
      { id: 'explain-why', label: 'Explain why this answer is correct', prompt: 'What part of the explanation is confusing?' },
      { id: 'simpler', label: 'Explain in simpler language', prompt: 'Which part do you want explained more simply?' },
      { id: 'why-wrong', label: 'Why is an option wrong?', prompt: 'Which option are you wondering about?' },
      { id: 'teacher-diff', label: 'My teacher or book explains this differently', prompt: 'What does your teacher or book say?' }
    ]
  },
  '2D': {
    header: "What's wrong with this question?",
    category: 'Not the Right Question',
    options: [
      { id: 'wrong-content', label: 'The question itself has wrong or incorrect content', prompt: "What's wrong with the question?" },
      { id: 'already-seen', label: "I've already seen this question before", prompt: 'Same test or a different one?' },
      { id: 'wrong-subject', label: 'This is under the wrong subject or chapter', prompt: 'What subject should this be under?' },
      { id: 'wrong-language', label: 'This is in the wrong language or out of syllabus', prompt: 'What language were you expecting?' }
    ]
  }
}

export const OTHERS_PLACEHOLDER = 'For example: the question is in the wrong language, or a formula is missing, or an option is cut off...'
