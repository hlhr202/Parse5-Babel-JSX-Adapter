import type { Attribute, TreeAdapter } from 'parse5';

export interface ParentNode {
  type: babel.types.Node['type'];
  children: babel.Node[];
}

export class BabelJSXWrapperDocument {
  type = 'BabelJSXWrapperDocument' as 'BabelJSXWrapperDocument';
  constructor(private root: babel.types.File) {}

  get rawRoot() {
    return this.root;
  }

  get ast() {
    const jsxBody = this.root.program
      .body[0] as babel.types.ExpressionStatement;
    const root = jsxBody.expression as babel.types.JSXElement;
    const html = root.children[0] as babel.types.JSXElement;
    const body = html.children[1] as babel.types.JSXElement;
    const entry = body.children[0] as babel.types.JSXElement;
    return entry;
  }
}

export class Adapter implements TreeAdapter {
  root?: babel.types.JSXElement;
  setDocumentMode = () => {}; // no op
  getDocumentMode = () => 'no-quirks' as 'no-quirks';
  setDocumentType = () => {}; // no op
  getDocumentTypeNodeName = () => ''; // no op
  getDocumentTypeNodePublicId = () => ''; // no op
  getDocumentTypeNodeSystemId = () => ''; // no op
  detachNode = () => {}; // no op
  getNamespaceURI = () => ''; // no op
  isDocumentTypeNode = () => false;
  getParentNode = () => ({}); // no op
  setTemplateContent = () => {}; // no op
  getTemplateContent = () => ({}); // no op
  getNodeSourceCodeLocation = () => ({} as any); // no op;
  setNodeSourceCodeLocation = () => {}; // no op

  isTextNode = (node: babel.types.JSXText) => {
    return node.type === 'JSXText';
  };

  isElementNode = (node: babel.types.JSXElement) => {
    return node.type === 'JSXElement';
  };

  isCommentNode = (node: babel.types.Comment) => {
    return node.type === 'CommentBlock' || node.type === 'CommentLine';
  };

  getTagName = (node: babel.types.JSXElement) => {
    return (node.openingElement.name as babel.types.JSXIdentifier).name;
  };

  getTextNodeContent = (node: babel.types.JSXText) => {
    return node.value;
  };

  getFirstChild = (node: babel.types.JSXElement) => {
    return node.children[0];
  };

  getCommentNodeContent = (node: babel.types.Comment) => {
    return node.value;
  };

  getChildNodes = (node: babel.types.JSXElement) => {
    return node.children;
  };

  getAttrList = (element: babel.types.JSXElement) => {
    return (element.openingElement
      .attributes as babel.types.JSXAttribute[]).map(({ name, value }) => ({
      name: name.name as string,
      value: (value as babel.types.StringLiteral).value,
    }));
  };

  createCommentNode = (value: string) => {
    return { type: 'CommentBlock', value } as babel.types.CommentBlock;
  };

  createDocument = () => {
    return new BabelJSXWrapperDocument({
      type: 'File',
      program: {
        type: 'Program',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'JSXElement',
              children: [] as any[],
              selfClosing: false,
              openingElement: {
                type: 'JSXOpeningElement',
                name: {
                  type: 'JSXIdentifier',
                  name: 'root',
                },
                attributes: [] as any[],
              },
              closingElement: {
                type: 'JSXClosingElement',
                name: {
                  type: 'JSXIdentifier',
                  name: 'root',
                },
              },
            },
          },
        ],
      } as babel.types.Program,
    } as babel.types.File);
  };

  createDocumentFragment = () => {
    return this.createDocument();
  };

  createTextNode = (value: string) => {
    return { type: 'JSXText', value } as babel.types.JSXText;
  };

  insertText = (parentNode: ParentNode, text: string) => {
    this.appendChild(parentNode, this.createTextNode(text));
  };

  insertTextBefore = (
    parentNode: ParentNode,
    text: string,
    referenceNode: babel.types.Node
  ) => {
    const prevNode =
      parentNode.children[parentNode.children.indexOf(referenceNode) - 1];

    if (prevNode && prevNode.type === 'JSXText') {
      prevNode.value += text;
    } else {
      this.insertBefore(parentNode, this.createTextNode(text), referenceNode);
    }
  };

  insertBefore = (
    parentNode: ParentNode,
    newNode: babel.Node,
    referenceNode: babel.Node
  ) => {
    const insertionIdx = parentNode.children.indexOf(referenceNode);
    parentNode.children.splice(insertionIdx, 0, newNode);
  };

  adoptAttributes = (recipient: babel.types.JSXElement, attrs: Attribute[]) => {
    const recipientAttrsMap: babel.types.JSXAttribute[] = [];

    for (let i = 0; i < recipient.openingElement.attributes.length; i++) {
      recipientAttrsMap.push(
        recipient.openingElement.attributes[i] as babel.types.JSXAttribute
      );
    }

    for (let j = 0; j < attrs.length; j++) {
      if (
        !recipientAttrsMap.find(({ name: { name } }) => name === attrs[j].name)
      ) {
        const { name, value } = attrs[j];
        recipient.openingElement.attributes.push({
          type: 'JSXAttribute',
          name: { type: 'JSXIdentifier', name },
          value: { type: 'StringLiteral', value },
        } as babel.types.JSXAttribute);
      }
    }
  };

  createElement = (
    tagName: string,
    _namespaceURI: any, // TODO: handle namespaceURI
    attrs: Attribute[]
  ) => {
    const attributes = attrs.map(
      // TODO: handle namespace attributes
      ({ name, value }) =>
        ({
          type: 'JSXAttribute',
          name: { type: 'JSXIdentifier', name },
          value: { type: 'StringLiteral', value },
        } as babel.types.JSXAttribute)
    );
    const element = {
      type: 'JSXElement',
      children: [] as any[],
      openingElement: {
        type: 'JSXOpeningElement',
        name: { type: 'JSXIdentifier', name: tagName },
        attributes,
      },
      closingElement: {
        type: 'JSXClosingElement',
        name: { type: 'JSXIdentifier', name: tagName },
      },
      selfClosing: false,
    } as babel.types.JSXElement;
    if (tagName === 'body') {
      this.root = element;
    }
    return element;
  };

  appendChild = (
    parentNode: ParentNode | BabelJSXWrapperDocument,
    newNode: babel.Node
  ) => {
    if (!parentNode) parentNode = this.root!;
    if (parentNode.type === 'BabelJSXWrapperDocument') {
      const body = ((parentNode.rawRoot as any) as babel.types.File).program
        .body[0] as babel.types.ExpressionStatement;
      (body.expression as babel.types.JSXElement).children.push(
        newNode as babel.types.JSXElement
      );
    } else {
      parentNode.children.push(newNode);
    }
  };
}
