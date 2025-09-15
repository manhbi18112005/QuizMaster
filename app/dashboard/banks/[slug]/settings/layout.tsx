import { MaxWidthWrapper } from "@/components/ui/max-width-wrapper";
import { PropsWithChildren } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function SettingsLayout({ children }: PropsWithChildren) {
  return (
    <ContentLayout>
      <div className="relative min-h-[calc(100vh-16px)]">
        <MaxWidthWrapper className="grid grid-cols-1 gap-5 pb-10 pt-3">
          {children}
        </MaxWidthWrapper>
      </div>
    </ContentLayout>
  );
}