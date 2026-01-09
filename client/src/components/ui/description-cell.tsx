import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
const DescriptionCell: React.FC<{ content: string }> = ({ content }) => {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!textRef.current || expanded) return;

    const el = textRef.current;
    setIsClamped(el.scrollHeight > el.clientHeight);
  }, [content, expanded]);

  return (
    <div className="text-sm pr-2 max-w-full">
      {/* TEXT */}
      <p
        ref={textRef}
        className={`max-w-full whitespace-normal wrap-break-word ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {content}
      </p>

      {/* ACTION */}
      {isClamped && (
        <Button
          variant="link"
          className="mt-1 h-auto p-0 text-xs"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Less" : "More"}
        </Button>
      )}
    </div>
  );
};

export default DescriptionCell;
