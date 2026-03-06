import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"
const ResizablePanelGroup = (ResizablePrimitive as any).PanelGroup || ((props: any) => <div {...props} />)
const ResizablePanel = ResizablePrimitive.Panel
const ResizableHandle = ({ withHandle, className, ...props }: any) => (
  <div className={className} {...props}>
    {withHandle && <div><GripVertical /></div>}
  </div>
)
export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
