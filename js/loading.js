/**
 * Crossy Road In Real Road
 * 2022-2 Computer Graphics Term Project
 */

/**
 * @author
 * Dept. of Software, Gachon Univ.
 * 201835465 서지원
 * 201835510 임찬호
 * 201835474 안해빈
 * 201935121 임혜균
 */
let loading = undefined;

export function initLoading() {
    loading = new ldBar("#loadingbar");
}

export function setLoadingValue(value) {
    loading.set(value);
}