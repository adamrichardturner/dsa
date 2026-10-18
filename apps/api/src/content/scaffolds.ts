const treeClass = `class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(
    value: number,
    left: TreeNode | null = null,
    right: TreeNode | null = null,
  ) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function buildTree(values: Array<number | null>): TreeNode | null {
  const first = values[0];
  if (first === undefined || first === null) {
    return null;
  }

  const root = new TreeNode(first);
  const queue: TreeNode[] = [root];
  let index = 1;

  while (queue.length > 0 && index < values.length) {
    const node = queue.shift();
    if (node === undefined) {
      return root;
    }

    const leftValue = values[index];
    index += 1;
    if (leftValue !== undefined && leftValue !== null) {
      node.left = new TreeNode(leftValue);
      queue.push(node.left);
    }

    const rightValue = values[index];
    index += 1;
    if (rightValue !== undefined && rightValue !== null) {
      node.right = new TreeNode(rightValue);
      queue.push(node.right);
    }
  }

  return root;
}
`;

const listClass = `class ListNode {
  value: number;
  next: ListNode | null;

  constructor(value: number, next: ListNode | null = null) {
    this.value = value;
    this.next = next;
  }
}

function fromArray(values: number[]): ListNode | null {
  let head: ListNode | null = null;

  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (value === undefined) {
      continue;
    }
    head = new ListNode(value, head);
  }

  return head;
}
`;

const bstClass = `class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(
    value: number,
    left: TreeNode | null = null,
    right: TreeNode | null = null,
  ) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}
`;

export const treeStarter = (signature: string, body: string): string => {
  return `${treeClass}
${signature} {
  const root = buildTree(values);
${body}
}
`;
};

export const listStarter = (signature: string, body: string): string => {
  return `${listClass}
${signature} {
  const head = fromArray(values);
${body}
}
`;
};

export const bstStarter = (signature: string, body: string): string => {
  return `${bstClass}
${signature} {
${body}
}
`;
};
