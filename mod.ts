import * as Lib from "./lib/deno_jieba.generated.js";

await Lib.instantiate();

type Fn<A, B> = (x: A) => B;

const List = {
  map: <A, B>(fn: Fn<A, B>) => (list: A[]) => list.map(fn),
};

const String = {
  split: (separator: string) => (text: string) => text.split(separator),
};

const Split = {
  Row: String.split(Lib.get_row_separator()),
  Col: String.split(Lib.get_col_separator()),
};

type Algorithm =
  | typeof Lib.extract_tags_by_tfidf
  | typeof Lib.extract_tags_by_textrank;
const extractTags = (fn: Algorithm) =>
  (sentence: string, top_k = 20, allowed_pos = []): string[][] =>
    List.map(Split.Col)(
      Split.Row(fn(sentence, top_k, allowed_pos.join(Lib.get_col_separator()))),
    );

const Tag = ([word, tag]: string[]): Tag => ({ word, tag: tag as TagType });

const Token = ([word, start, end]: string[]): Token => ({
  word,
  start: Number(start),
  end: Number(end),
});

// ================================================================

/**
 * Mode for switch word cutting algorithm
 */
export enum CutMode {
  /** default */
  Default = 0,
  /** Hidden Markov Model */
  HMM = 1,
  /** all */
  All = 2,
}

/**
 * Mode for switch tokenize algorithm
 */
export enum TokenizeMode {
  /** default */
  Default = 0,
  /** search */
  Search = 1,
}

/**
 * Reset word dictionary
 *
 * ## Examples
 *
 * ```ts
 * import { reset } from './mod';
 * reset();
 * ```
 */
export const reset = Lib.reset;

/**
 * add word in dictionary
 *
 * ## Examples
 *
 * ```ts
 * import { addWord } from './mod';
 * addWord("中出", 10000, "v");
 * ```
 */
export const addWord = (word: string, freg = -1, tag: TagType | "" = "") =>
  Lib.add_word(word, freg, tag);

/**
 * Load extra dictionary
 * @param {Uint8Array | string | URL} source
 * @returns {Promise<string>}
 *
 * ## Examples
 *
 * ```ts
 * import { loadDict } from './mod';
 *  loadDict('my-dictionary-path');
 * ```
 */
export const loadDict = (source: Uint8Array | string | URL): string =>
  typeof source === "string" || source instanceof URL
    ? Lib.load_dict(Deno.readFileSync(source))
    : Lib.load_dict(source);

/**
 * Init with extra dictionary
 * @param {Uint8Array | string | URL} source
 * @returns {Promise<string>}
 *
 * ## Examples
 *
 * ```ts
 * import { withDict } from './mod';
 *  withDict('my-dictionary-path');
 * ```
 */
export const withDict = (source: Uint8Array | string | URL): void =>
  typeof source === "string" || source instanceof URL
    ? Lib.with_dict(Deno.readFileSync(source))
    : Lib.with_dict(source);

/**
 * Suggest word frequency to force the characters in a word to be joined or splitted
 * @param {string} word
 * @returns {number}
 *
 * ```ts
 * import { suggestFreq } from './mod.ts';
 * suggestFreq("中出");
 * ```
 */
export const suggestFreq = Lib.suggest_freq;

/**
 * divide strings into lists of substrings
 *
 * @param {string} sentence - source string
 * @param {CutMode} mode - {@link CutMode}
 * @returns {Promise<string[]>}
 *
 * ## Examples
 *
 * - cut in default mode
 * ```ts
 * import { cut } from './mod.ts';
 *  cut("我来到北京清华大学");
 * // ["我", "来到", "北京", "清华大学"],
 * ```
 *
 * - cut in HMM mode
 * ```ts
 * import { cut, CutMode } from './mod.ts';
 *  cut("我来到北京清华大学", CutMode.HMM);
 * // ["我", "来到", "北京", "清华大学"],
 * ```
 *
 * - cut in All mode
 * ```ts
 * import { cut, CutMode } from './mod.ts';
 *  cut("我来到北京清华大学", CutMode.All);
 * // [ "我", "来", "来到", "到", "北", "北京", "京", "清", "清华", "清华大学", "华", "华大", "大", "大学", "学" ]
 * ```
 */
export const cut = (
  sentence: string,
  mode: CutMode = CutMode.Default,
): string[] => {
  if (mode === CutMode.All) {
    return Split.Row(Lib.cut_all(sentence));
  }

  return Split.Row(Lib.cut(sentence, mode));
};

/**
 * divide strings into lists of substrings, for search engine
 *
 * @param {string} sentence - source string
 * @param {CutMode.Default | CutMode.HMM} mode - {@link CutMode}
 *
 * ## Examples
 *
 * ```ts
 * import { cutForSearch } from './main';
 *  cutForSearch("小明硕士毕业于中国科学院计算所，后在日本京都大学深造", CutMode.HMM);
 * // [ "小明", "硕士", "毕业", "于", "中国", "科学", "学院", "科学院", "中国科学院", "计算", "计算所", "，", "后", "在", "日本", "京都", "大学", "日本京都大学", "深造" ]
 * ```
 */
export const cutForSearch = (
  sentence: string,
  mode: CutMode.Default | CutMode.HMM = CutMode.Default,
): string[] => Split.Row(Lib.cut_for_search(sentence, mode));

export type TagType =
  | "n" // 普通名词
  | "f" // 方位名词
  | "s" // 处所名词
  | "t" // 时间
  | "nr" // 人名
  | "ns" // 地名
  | "nt" // 机构名
  | "nw" // 作品名
  | "nz" // 其他专名
  | "v" // 普通动词
  | "vd" // 动副词
  | "vn" // 名动词
  | "a" // 形容词
  | "ad" // 副形词
  | "an" // 名形词
  | "d" // 副词
  | "m" // 数量词
  | "q" // 量词
  | "r" // 代词
  | "p" // 介词
  | "c" // 连词
  | "u" // 助词
  | "xc" // 其他虚词
  | "w" // 标点符号
  | "PER" // 人名
  | "LOC" // 地名
  | "ORG" // 机构名
  | "TIME"; // 时间

/** Tagged word */
export interface Tag {
  /** word token */
  word: string;
  /** word type */
  tag: TagType;
}

/**
 * extract tags from source string
 *
 * @param {string} sentence - source string
 * @param {CutMode.Default | CutMode.HMM} mode - {@link CutMode}
 * @returns {Promise<Tag[]>}
 *
 * ## Examples
 *
 * ```ts
 * import { tag } from './mod.ts';
 *  tag("我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。", CutMode.HMM);
 * ```
 */
export const tag = (
  sentence: string,
  mode: CutMode.Default | CutMode.HMM = CutMode.Default,
): Tag[] =>
  List.map(Tag)(
    List.map(Split.Col)(
      Split.Row(Lib.tag(sentence, mode)),
    ),
  );

/**
 * Token group with word token and spans
 */
export interface Token {
  /** token */
  word: string;
  /** start position of the source string */
  start: number;
  /** end position of the source string */
  end: number;
}

/**
 * string tokenization
 *
 * @param {string} sentence - source string
 * @param {TokenizeMode} tokenize_mode - {@link TokenizeMode}
 * @param {CutMode.Default | CutMode.HMM} cut_mode - {@link CutMode}
 *
 * ## Examples
 *
 * ```ts
 * import { tokenize } from './mod.ts';
 *  tokenize("南京市长江大桥");
 * ```
 */
export const tokenize = (
  sentence: string,
  tokenize_mode: TokenizeMode = TokenizeMode.Default,
  cut_mode: CutMode.Default | CutMode.HMM = CutMode.Default,
): Token[] =>
  List.map(Token)(
    List.map(Split.Col)(
      Split.Row(
        Lib.tokenize(sentence, tokenize_mode, cut_mode),
      ),
    ),
  );

export const TFIDF = {
  extractTags: extractTags(Lib.extract_tags_by_tfidf),
};
export const TextRank = {
  extractTags: extractTags(Lib.extract_tags_by_textrank),
};
