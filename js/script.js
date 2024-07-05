let all_tags = {};

const init = () => {

  const updateCopyrightYear = () => {
    $span = $("#footer-copyright-year");
    const year = new Date().getFullYear();
    $span.text(year);
  }

  // タグからテキストを抽出する
  const getTagText = ($tag) => {
    const $clone = $tag.clone();
    $clone.find('span').remove();
    return $clone.text();
  }

  // データを読み込む
  const loadData = () => {

    // タグ一覧を表示する
    const showTags = () => {
      // 出現回数の降順にキーをソートする
      let sorted = Object.keys(all_tags).sort((a, b) => all_tags[b] - all_tags[a]);

      let sortedGroups = {};
      for (let key of sorted) {
        sortedGroups[key] = all_tags[key];
      }
      
      for (tag in sortedGroups) {
        const html = '<div class="tag selected">' + tag + '<span>' + sortedGroups[tag] + '</span></div>';
        $("#section-tags").find(".tags-content").append(html);
      }

      // タグのイベントをバインド
      $("#section-tags").find(".tag").on("click", function(){
        if ($(this).hasClass("selected")) {
          $(this).removeClass("selected");
        } else {
          $(this).addClass("selected");
        }

        // クリックイベントを記録する
        const t = getTagText($(this));
        console.log(t);
        logClickEvent("tag", t);

        // 最後にプロジェクトを表示する
        showProjects();
      });
    }

    // 非同期で
    const drawImages = async () => {
      const loadImage = async (url, $element) => {
      }

      $("#section-projects").find(".image").each(function() {
        const $image = $(this);
        const src = $image.attr("src");

        const img = new Image();
        img.onload = function() {
          $image.css('background-image', 'url(' + src + ')');
        };
        img.onerror = function() {
          console.warn('画像の読み込みに失敗しました: ' + src);
        };
        img.src = src;
      });
    }

    const url = "./data/data.json";
    const $projects = $("#section-projects");

    // JSONファイルを読み込む
    $.getJSON(url, function(data) {

      // 新しい順にしたいので逆順にする
      data = data.reverse();

      data.map(function(project){
        let html =  '<div class="project show">'
                      + '<div class="image" src="' + project.image + '">'
                        + '<a href="' + project.url + '" target="_blank"></a>'
                      + '</div>'
                      + '<div class="info">'
                        + '<a href="' + project.url + '" target="_blank">'
                          + '<h4>' + project.title + '</h4>'
                        + '</a>'
                        + '<div class="tags">'
                      ;

        const tags = project.tags.split(",");
        tags.map(function(tag){
          html += '<div class="tag">' + tag + '</div>';
          all_tags[tag] = (all_tags[tag] || 0) + 1;
        });

        html +=    '</div>'
              + '</div>';

        $projects.append(html);
      });

      // 後からデータを読み込む
      drawImages();

      // タグ一覧を表示する
      showTags();

      // カバーを消す
      $("#section-cover").addClass("hide");

    // ファイルの読み込みに失敗したとき
    }).fail(function() {
      alert("保存されたグラフの読み込みに失敗しました。");
    });
  }

  // プロジェクト一覧を表示する
  const showProjects = () => {

    let selected_tags = [];
    $("#section-tags").find(".tag").each(function(){
      if ($(this).hasClass("selected")) {
        const txt = getTagText($(this));
        selected_tags.push(txt);
      }
    });

    $("#section-projects").find(".project").each(function(){
      let hit = false;
      $(this).find(".tag").each(function(){
        if (selected_tags.indexOf($(this).text()) !== -1) {
          hit = true;
        }
      });

      if (hit) {
        $(this).addClass("show");
      } else {
        $(this).removeClass("show");
      }
    });
  }

  // GA4のクリックイベントを記録する
  const logClickEvent = async (category, label) => {
    gtag('event', 'click', {
      'event_category': category,
      'event_label': label,
      'value': 1
    });
  }

  // イベントのバインド
  const bindEvents = () => {

    // 「タグ一覧」をクリックしたとき
    $("#section-tags").find(".tags-title").on("click", function(){
      $section = $(this).closest("#section-tags");
      if ($section.hasClass("open")) {
        $section.removeClass("open");
      } else {
        $section.addClass("open");
      }

      // クリックイベントを記録する
      logClickEvent("tags", "expand");
    });

    // プロジェクトのリンクをクリックしたとき
    $("#section-projects").on("click", "a", function(){
      const href = $(this).attr("href");
      logClickEvent("project", href);
    });

  }

  updateCopyrightYear();
  loadData();
  bindEvents();
}

$(function(){
  init();
});
