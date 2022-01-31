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
  const popoverTriggerList = [].slice.call(
    document.querySelectorAll(`#${identifier} [data-bs-toggle="popover"]`)
  );
  const popovers = popoverTriggerList.map(
    popoverTrigger =>
      new Popover(popoverTrigger, {
        container: 'body',
        html: true,
        sanitize: false,
      })
  );

  popoverTriggerList.forEach((popoverTrigger, index) => {
    const previousSibling = popoverTrigger.previousElementSibling;
    let timeout = null;

    previousSibling.onmouseenter = () => {
      if (!timeout) {
        popovers[index].show();
        previousSiblingOnMouseEnter(previousSibling);
      } else {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    previousSibling.onmouseleave = () => {
      previousSiblingOnMouseLeave(previousSibling);
      timeout = setTimeout(() => {
        popovers[index].hide();
        timeout = null;
      }, 500);
    };
  });
}
