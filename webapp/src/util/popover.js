import { Popover } from 'bootstrap';

/**
 * Create popovers for all descendants of an element
 * @param {string} identifier id of the parent element
 * @param {(previousSibling: HTMLElement) => void} previousSiblingOnMouseEnter function
 * to be called when the mouse enters the popover trigger's previous sibling
 * @param {(previousSibling: HTMLElement) => void} previousSiblingOnMouseLeave function
 * to be called when the mouse leaves the popover trigger's previous sibling
 */
export default function createPopovers(
  identifier,
  previousSiblingOnMouseEnter,
  previousSiblingOnMouseLeave
) {
  const popoverTriggerList = document.querySelectorAll(
    `#${identifier} [data-bs-toggle="popover"]`
  );
  const popovers = [...popoverTriggerList].map(
    (popoverTrigger) =>
      new Popover(popoverTrigger, {
        container: 'body',
        html: true,
        sanitize: false,
      })
  );

  popoverTriggerList.forEach((popoverTrigger, i) => {
    const previousSibling = popoverTrigger.previousElementSibling;
    let leaveTimeout = null;

    const setLeaveTimeout = () => {
      leaveTimeout = setTimeout(() => {
        popovers[i].hide();
        leaveTimeout = null;
      }, 500);
    };

    const clearLeaveTiemout = () => {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    };

    previousSibling.onmouseenter = () => {
      previousSiblingOnMouseEnter(previousSibling);
      if (!leaveTimeout) popovers[i].show();
      else clearLeaveTiemout();
    };

    previousSibling.onmouseleave = () => {
      previousSiblingOnMouseLeave(previousSibling);
      setLeaveTimeout();
    };
  });
}
