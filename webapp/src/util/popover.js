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
    let shown = false;

    popoverTrigger.addEventListener('hidden.bs.popover', () => {
      shown = false;
    });

    previousSibling.onmouseenter = () => {
      previousSiblingOnMouseEnter(previousSibling);
      if (!shown) {
        shown = true;
        popovers[i].show();
      } else clearTimeout(leaveTimeout);
    };

    previousSibling.onmouseleave = () => {
      previousSiblingOnMouseLeave(previousSibling);
      leaveTimeout = setTimeout(() => {
        popovers[i].hide();
      }, 500);
    };
  });
}
