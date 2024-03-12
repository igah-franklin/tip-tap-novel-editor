import { BubbleMenu, BubbleMenuProps } from "@tiptap/react";
import cx from "classnames";
import { FC, useState } from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  AlignRight,
  AlignCenter,
  AlignLeft
} from "lucide-react";

// import { AISelector } from "./ai-selector";
import { NodeSelector } from "./node-selector";
import { ColorSelector } from "./color-selector";

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: typeof BoldIcon;
}

type EditorBubbleMenuProps = Omit<BubbleMenuProps, "children">;

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props) => {
  const items: BubbleMenuItem[] = [
    {
      name: "bold",
      isActive: () => props.editor.isActive("bold"),
      command: () => props.editor.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: () => props.editor.isActive("italic"),
      command: () => props.editor.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: () => props.editor.isActive("underline"),
      command: () => props.editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: () => props.editor.isActive("strike"),
      command: () => props.editor.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "code",
      isActive: () => props.editor.isActive("code"),
      command: () => props.editor.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
    {
      name: "textAlign",
      isActive: () => props.editor.isActive({ textAlign: 'left' }),
      command: () => props.editor.chain().focus().setTextAlign('left').run(),
      icon: AlignLeft,
    },
    {
      name: "textAlign",
      isActive: () => props.editor.isActive({ textAlign: 'center' }),
      command: () => props.editor.chain().focus().setTextAlign('center').run(),
      icon: AlignCenter,
    },
    {
      name: "textAlign",
      isActive: () => props.editor.isActive({ textAlign: 'right' }),
      command: () => props.editor.chain().focus().setTextAlign('right').run(),
      icon: AlignRight,
    },
  ];
  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    shouldShow: ({ editor }) => {
      // don't show if image is selected
      if (editor.isActive("image")) {
        return false;
      }
      return editor.view.state.selection.content().size > 0;
    },
    tippyOptions: {
      moveTransition: "transform 0.15s ease-out",
      onHidden: () => {
        setIsNodeSelectorOpen(false);
        // setIsAISelectorOpen(false);
        setIsColorSelectorOpen(false);
      },
    },
  };

  // const [isAISelectorOpen, setIsAISelectorOpen] = useState(false);
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);

  return (
    <BubbleMenu
      {...bubbleMenuProps}
      className="flex w-fit overflow-hidden rounded border border-stone-200 bg-white shadow-xl"
    >
      {/* <AISelector
        editor={props.editor}
        isOpen={isAISelectorOpen}
        setIsOpen={() => {
          setIsAISelectorOpen(!isAISelectorOpen);
          setIsNodeSelectorOpen(false);
          setIsColorSelectorOpen(false);
        }}
      /> */}
      <NodeSelector
        editor={props.editor}
        isOpen={isNodeSelectorOpen}
        setIsOpen={() => {
          setIsNodeSelectorOpen(!isNodeSelectorOpen);
          // setIsAISelectorOpen(false);
          setIsColorSelectorOpen(false);
        }}
      />

      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.command}
          className="p-2 text-stone-600 hover:bg-stone-100 active:bg-stone-200"
        >
          <item.icon
            className={cx("h-4 w-4", {
              "text-blue-500": item.isActive(),
            })}
          />
        </button>
      ))}
      <ColorSelector
        editor={props.editor}
        isOpen={isColorSelectorOpen}
        setIsOpen={() => {
          setIsColorSelectorOpen(!isColorSelectorOpen);
          setIsNodeSelectorOpen(false);
          // setIsAISelectorOpen(false);
        }}
      />
    </BubbleMenu>
  );
};
