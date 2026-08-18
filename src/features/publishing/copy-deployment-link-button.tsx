"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CopyDeploymentLinkButton({
  deploymentUrl,
}: {
  deploymentUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copyDeploymentLink() {
    await navigator.clipboard.writeText(deploymentUrl);
    setCopied(true);

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2500);
  }

  return (
    <Tooltip open={copied}>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={copied ? "App link copied" : "Copy app link"}
            onClick={copyDeploymentLink}
          />
        }
      >
        {copied ? <Check /> : <Link2 />}
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        hideArrow
        className="bg-popover text-popover-foreground shadow-md"
      >
        Copied app link to clipboard
      </TooltipContent>
    </Tooltip>
  );
}
