/**
 * Safe Node.prototype.removeChild and insertBefore polyfill guard.
 * Prevents React 19 / Next.js Webpack runtime crash:
 * "TypeError: Cannot read properties of null (reading 'removeChild')"
 * which occurs when browser extensions, translation tools, password managers,
 * or portal cleanup unmount nodes outside React's internal fiber tracking.
 */
export function initDomRemovalGuard(): void {
  if (typeof window === "undefined" || (window as unknown as Record<string, boolean>).__domGuardInstalled) {
    return;
  }

  (window as unknown as Record<string, boolean>).__domGuardInstalled = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child) as T;
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
      }
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
