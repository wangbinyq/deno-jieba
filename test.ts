import { assertEquals } from "https://deno.land/std@0.148.0/testing/asserts.ts";
import {
  addWord,
  cut,
  cutForSearch,
  CutMode,
  loadDict,
  reset,
  suggestFreq,
  tag,
  tokenize,
  TokenizeMode,
} from "./mod.ts";

Deno.test("Test reset", () => {
  assertEquals(suggestFreq("中出"), 348);

  loadDict(new TextEncoder().encode("中出 10000"));
  assertEquals(suggestFreq("中出"), 10001);

  reset();
  assertEquals(suggestFreq("中出"), 348);
});

Deno.test("Test addWord", () => {
  assertEquals(suggestFreq("中出"), 348);

  addWord("中出", 10000, "v");
  assertEquals(suggestFreq("中出"), 10001);

  reset();
  assertEquals(suggestFreq("中出"), 348);
});

Deno.test("Test loadDict", () => {
  assertEquals(
    tokenize("我们中出了一个叛徒", TokenizeMode.Default, CutMode.Default),
    [
      {
        word: "我们",
        start: 0,
        end: 2,
      },
      {
        word: "中",
        start: 2,
        end: 3,
      },
      {
        word: "出",
        start: 3,
        end: 4,
      },
      {
        word: "了",
        start: 4,
        end: 5,
      },
      {
        word: "一个",
        start: 5,
        end: 7,
      },
      {
        word: "叛徒",
        start: 7,
        end: 9,
      },
    ],
  );

  loadDict(new TextEncoder().encode("中出 10000"));
  assertEquals(
    tokenize("我们中出了一个叛徒", TokenizeMode.Default, CutMode.Default),
    [
      {
        word: "我们",
        start: 0,
        end: 2,
      },
      {
        word: "中出",
        start: 2,
        end: 4,
      },
      {
        word: "了",
        start: 4,
        end: 5,
      },
      {
        word: "一个",
        start: 5,
        end: 7,
      },
      {
        word: "叛徒",
        start: 7,
        end: 9,
      },
    ],
  );

  reset();
});

Deno.test("Test suggestFreq", () => {
  assertEquals(suggestFreq("中出"), 348);
  assertEquals(suggestFreq("出了"), 1263);
});

Deno.test("Test cut", () => {
  assertEquals(cut("我来到北京清华大学"), [
    "我",
    "来到",
    "北京",
    "清华大学",
  ]);
});

Deno.test("Test cut with HMM", () => {
  assertEquals(cut("我来到北京清华大学", CutMode.HMM), [
    "我",
    "来到",
    "北京",
    "清华大学",
  ]);
});

Deno.test("Test cut with All", () => {
  assertEquals(cut("我来到北京清华大学", CutMode.All), [
    "我",
    "来",
    "来到",
    "到",
    "北",
    "北京",
    "京",
    "清",
    "清华",
    "清华大学",
    "华",
    "华大",
    "大",
    "大学",
    "学",
  ]);
});

Deno.test("Test cutForSearch with HMM", () => {
  assertEquals(
    cutForSearch(
      "小明硕士毕业于中国科学院计算所，后在日本京都大学深造",
      CutMode.HMM,
    ),
    [
      "小明",
      "硕士",
      "毕业",
      "于",
      "中国",
      "科学",
      "学院",
      "科学院",
      "中国科学院",
      "计算",
      "计算所",
      "，",
      "后",
      "在",
      "日本",
      "京都",
      "大学",
      "日本京都大学",
      "深造",
    ],
  );
});

Deno.test("Test tag", () => {
  assertEquals(
    tag(
      "我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。",
      CutMode.HMM,
    ),
    [
      { word: "我", tag: "r" },
      { word: "是", tag: "v" },
      {
        word: "拖拉机",
        tag: "n",
      },
      {
        word: "学院",
        tag: "n",
      },
      {
        word: "手扶拖拉机",
        tag: "n",
      },
      {
        word: "专业",
        tag: "n",
      },
      { word: "的", tag: "uj" },
      { word: "。", tag: "x" },
      {
        word: "不用",
        tag: "v",
      },
      {
        word: "多久",
        tag: "m",
      },
      { word: "，", tag: "x" },
      { word: "我", tag: "r" },
      { word: "就", tag: "d" },
      { word: "会", tag: "v" },
      {
        word: "升职",
        tag: "v",
      },
      {
        word: "加薪",
        tag: "nr",
      },
      { word: "，", tag: "x" },
      {
        word: "当上",
        tag: "t",
      },
      {
        word: "CEO",
        tag: "eng",
      },
      { word: "，", tag: "x" },
      {
        word: "走上",
        tag: "v",
      },
      {
        word: "人生",
        tag: "n",
      },
      {
        word: "巅峰",
        tag: "n",
      },
      { word: "。", tag: "x" },
    ],
  );
});

Deno.test("Test tokenize default", () => {
  assertEquals(tokenize("南京市长江大桥"), [
    {
      word: "南京市",
      start: 0,
      end: 3,
    },
    {
      word: "长江大桥",
      start: 3,
      end: 7,
    },
  ]);
});

Deno.test("Test tokenize with Search Mode", () => {
  assertEquals(tokenize("南京市长江大桥", TokenizeMode.Search), [
    {
      word: "南京",
      start: 0,
      end: 2,
    },
    {
      word: "京市",
      start: 1,
      end: 3,
    },
    {
      word: "南京市",
      start: 0,
      end: 3,
    },
    {
      word: "长江",
      start: 3,
      end: 5,
    },
    {
      word: "大桥",
      start: 5,
      end: 7,
    },
    {
      word: "长江大桥",
      start: 3,
      end: 7,
    },
  ]);
});

Deno.test("Test tokenize default with HMM", () => {
  assertEquals(
    tokenize("我们中出了一个叛徒", TokenizeMode.Default, CutMode.HMM),
    [
      {
        word: "我们",
        start: 0,
        end: 2,
      },
      {
        word: "中出",
        start: 2,
        end: 4,
      },
      {
        word: "了",
        start: 4,
        end: 5,
      },
      {
        word: "一个",
        start: 5,
        end: 7,
      },
      {
        word: "叛徒",
        start: 7,
        end: 9,
      },
    ],
  );
});
