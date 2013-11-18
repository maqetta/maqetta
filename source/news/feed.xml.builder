xml.instruct!
xml.feed "xmlns" => "http://www.w3.org/2005/Atom" do
  xml.title "Maqetta News"
  xml.subtitle "Maqetta - Visual authoring of HTML5 user interfaces - in the browser"
  xml.id "http://maqetta.org/news/"
  xml.link "href" => "http://maqetta.org/news/"
  xml.link "href" => "http://maqetta.org/news/feed.xml", "rel" => "self"
  xml.updated blog.articles.first.date.to_time.iso8601

  blog.articles[0..5].each do |article|
    xml.entry do
      xml.title article.title
      xml.link "rel" => "alternate", "href" => "http://maqetta.org" + article.url
      xml.id article.url
      xml.published article.date.to_time.iso8601
      xml.updated article.date.to_time.iso8601
      xml.summary article.summary, "type" => "html"
      xml.content article.body, "type" => "html"
    end
  end
end