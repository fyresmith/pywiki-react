import re

import markdown
from markdown.preprocessors import Preprocessor
from markdown.extensions import Extension
from markdown.extensions.extra import ExtraExtension
from markdown.extensions.wikilinks import WikiLinkExtension
from markdown.extensions.sane_lists import SaneListExtension
from markdown.inlinepatterns import Pattern
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

DEFAULT_MARKDOWN = """
{
# This Is An Infobox
[https://placehold.co/286x180]
! Infoboxes are incredibly important to the wiki economy.
Label | Here is a Value
Another Label | Another Value :D
Labels Are Cool | Values are cooler
## Important Grouping of Information
 Organized Labels | Are much superior.
Final Label? | Yep. Final Label.
}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus quis arcu non felis commodo dictum. Nullam tincidunt orci nec porta imperdiet. Quisque condimentum ut ipsum quis mollis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis tempus ligula justo. Etiam vel nisl ante. Nullam ac neque turpis.

Vivamus rhoncus arcu eget nulla volutpat tincidunt. Pellentesque a bibendum ligula. Nam cursus odio nec nibh fermentum pretium. Nunc euismod, est rhoncus ultrices egestas, erat libero pretium felis, eget cursus tellus leo non neque. Pellentesque euismod ut mauris ac ultrices. Morbi porttitor non eros sed bibendum. Proin congue lacus non metus dignissim rutrum.

_This is some emphasized text._

*This is some more emphasized text.*

__This is some bold text.__

**This is some more bold text.**

***This is bold emphasized text.***

---

Footnotes[^1] have a label[^@#$%] and the footnote's content.

# Generic Sub Title

Nam semper nunc sit amet blandit vehicula. 

This is what an unordered list would look like :D

* Suspendisse aliquet nisi mauris, a aliquam ligula blandit faucibus. 
* Etiam tempor cursus porttitor. Aliquam elementum nulla et nisi sollicitudin rutrum. 
* Donec hendrerit tristique massa, eget lacinia eros eleifend vel. 
* Donec eget arcu id nisl pulvinar condimentum.

And this is what an ordered list looks like :)

1. Maecenas aliquet luctus augue vitae sagittis. 
2. Mauris vel turpis vel eros imperdiet bibendum. 
3. Quisque metus purus, ultrices vitae mi nec, mattis congue nisl. 
4. Vivamus nunc sem, tincidunt sit amet enim vitae, consequat accumsan felis.

## Simple Header

In et elit vitae augue tincidunt scelerisque et nec nulla. 

### This is a sub header!

Pellentesque pharetra tincidunt mi in pharetra. Pellentesque consequat congue nunc. Mauris aliquet tempus ex, sit amet tempor dui condimentum sed. Aenean non fringilla magna. 

### It's an easy way to divide up your content!

Donec ac porttitor felis, eu dignissim massa. Nulla eu dignissim dui, vestibulum vulputate dolor. Cras mi risus, ultricies a volutpat eu, euismod non odio. Phasellus aliquet sed libero in ullamcorper. Pellentesque quis risus vel magna condimentum tempus ac vitae velit. Nulla rutrum magna ut vestibulum maximus.

## Another Simple Header

In ultrices, enim ut varius finibus, metus tellus consequat risus, quis maximus nulla elit id mauris. Aliquam pretium metus sed placerat lobortis. In fringilla velit non tellus consequat, sed convallis felis pulvinar. Sed ac est luctus, semper purus non, dictum dui. Ut nisi velit, mattis eu ex vel, sodales tincidunt nisi. Nam et enim venenatis, malesuada ligula eu, maximus nisi. Duis finibus in metus id sagittis.

## Gotta Love Those Headers

Here is where I show you how to do links.

[An Example Link](http://example.com)
[Another Example Link](http://www.google.com)

Here is a reference to another page called Example. Unfortunately I cannot reference myself as Lorem Ipsum.

## Wow, ANOTHER header??

`This is a code block` Something in between them `And here's another code block`

# This is just a regular sub title.

## Blockquotes are awesome!

> This is a block quote.

Something in between.

> Now I will tell you the answer to my question. It is this. The Party seeks power entirely for its own sake. We are not interested in the good of others; we are interested solely in power, pure power. What pure power means you will understand presently. We are different from the oligarchies of the past in that we know what we are doing. All the others, even those who resembled ourselves, were cowards and hypocrites. The German Nazis and the Russian Communists came very close to us in their methods, but they never had the courage to recognize their own motives. They pretended, perhaps they even believed, that they had seized power unwillingly and for a limited time, and that just around the corner there lay a paradise where human beings would be free and equal. We are not like that. We know that no one ever seizes power with the intention of relinquishing it. Power is not a means; it is an end. One does not establish a dictatorship in order to safeguard a revolution; one makes the revolution in order to establish the dictatorship. The object of persecution is persecution. The object of torture is torture. The object of power is power. Now you begin to understand me.
> **- George Orwell, 1984**

## These are some tables:

[
=Table Header 1=Table Header 2=
|Table Cell 1|Table Cell 2|
|Table Cell 1|Table Cell 2|
|Table Cell 1|Table Cell 2|
|Table Cell 1|Table Cell 2|
|Table Cell 1|Table Cell 2|
]

[^1]: This is a footnote content.
[^@#$%]: A footnote on the label: "@#$%".
"""


class HeaderAdvancerExtension(markdown.postprocessors.Postprocessor):
    def run(self, text):
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('<h'):
                # Find the header tag and any additional attributes
                tag_start = line.find('<h')
                tag_end = line.find('>', tag_start)
                header_tag = line[tag_start:tag_end + 1]

                # Extract the header level using regex
                import re
                match = re.match(r'<h(\d+)', header_tag)
                if match:
                    header_level = int(match.group(1))

                    # Advance the header level by one
                    new_header_level = header_level + 1

                    # Replace the old header tag with the new one
                    new_header_tag = f'<h{new_header_level}'
                    if tag_end > tag_start:
                        new_header_tag += line[tag_end:tag_end + 1]

                    lines[i] = line.replace(header_tag, new_header_tag)

        # Join the modified lines back into the HTML
        modified_html = '\n'.join(lines)
        return modified_html


class TableExtension(Extension):
    def extendMarkdown(self, md):
        md.preprocessors.register(TableProcessor(md), 'custom_table', 30)


class TableProcessor(Preprocessor):
    def run(self, lines):
        new_lines = []
        in_table = False
        for line in lines:
            if line.strip() == '[':
                in_table = True
                new_lines.append('<div class="table-main"><table>')
            elif line.strip() == ']':
                in_table = False
                new_lines.append('</table></div>')
            elif in_table:
                processed_line = self.process_line(line)
                new_lines.append(processed_line)
            else:
                new_lines.append(line)
        return new_lines

    def process_line(self, line):
        line = line.strip()
        if line.startswith('='):
            headers = [header.strip() for header in line.split('=')]
            return self.process_table_header(headers)
        elif '|' in line:
            cells = [cell.strip() for cell in line.split('|')]
            return self.process_table_row(cells)
        else:
            return line

    def process_table_header(self, headers):
        result = "<tr>"

        for header in headers:
            if header != '':
                result += f'<th>{header}</th>'

        result += "</tr>"

        return result

    def process_table_row(self, cells):
        result = "<tr>"

        for cell in cells:
            if cell != '':
                result += f'<td>{cell}</td>'

        result += "</tr>"

        return result


def format_html(html_string):
    # Parse the HTML string
    soup = BeautifulSoup(html_string, 'html.parser')

    # Define the initial indentation level
    indentation = 0

    # Helper function to add tabs to a line
    def add_tabs(line):
        return '\t' * indentation + line

    # Helper function to remove excessive whitespace
    def clean_whitespace(line):
        return ' '.join(line.split())

    # Iterate through all tags in the HTML
    for tag in soup.descendants:
        # Check if the tag is a BeautifulSoup element
        if hasattr(tag, 'name'):
            # Add tabs to the start tag
            tag.insert_before(add_tabs(''))

            # Increase indentation for the tag content
            indentation += 1

            # Add tabs to the end tag
            tag.insert_after(add_tabs(''))

            # Remove excessive whitespace from the tag content
            if tag.string:
                tag.string.replace_with(clean_whitespace(tag.string))

            # Decrease indentation for the end tag
            indentation -= 1

    # Get the formatted HTML string
    formatted_html = soup.prettify()

    return formatted_html


def translate_info_card(info_box_markdown):
    lines = info_box_markdown.split('\n')
    card = "<Card>\n"
    in_list = False

    for line in lines:
        if line.startswith('# '):
            if in_list:
                in_list = False
                card += '\t</ListGroup>\n'

            card += f'\t<Card.Header className="text-center">{line[2:]}</Card.Header>\n'
        elif line.startswith('[') and line.endswith(']'):
            if in_list:
                in_list = False
                card += '\t</ListGroup>\n'

            card += f'\t<Card.Img variant="middle" src="{line[1:-1]}" />\n'
        elif line.startswith('## '):
            if in_list:
                in_list = False
                card += '\t</ListGroup>\n'

            card += f'\t<Card.Header variant="middle" className="text-center infoGroup">{line[3:]}</Card.Header>\n'
        elif line.startswith('! '):
            if in_list:
                in_list = False
                card += '\t</ListGroup>\n'

            card += f"""
            <Card.Body className="infoBody">
                <Card.Text className="infoText">
                    {line[2:]}
                </Card.Text>
            </Card.Body>
            """
        elif '|' in line:
            if not in_list:
                in_list = True
                card += '\t<ListGroup className="list-group-flush">\n'

            label, value = [item.strip() for item in line.split('|', 1)]
            card += f'\t\t<ListGroup.Item><CustomGridItem title="{label}" value="{value}"></CustomGridItem></ListGroup.Item>\n'

    if in_list:
        in_list = False
        card += '\t</ListGroup>\n'

    card += "</Card>\n"
    return card


def extract_info_box(markdown_text):
    info_box_pattern = r'\{[^{}]*?\n\}'

    # Search for the info box in the markdown text
    info_box_match = re.search(info_box_pattern, markdown_text, re.DOTALL)

    if info_box_match:
        # Extract the info box from the match
        info_box = info_box_match.group()

        # Remove the info box from the original string
        modified_markdown = re.sub(info_box_pattern, '', markdown_text, count=1, flags=re.DOTALL)

        return info_box, modified_markdown.strip()
    else:
        # Return None if no info box is found
        return None, markdown_text.strip()


class CustomWikiLinksExtension(WikiLinkExtension):
    def handleMatch(self, m):
        if m.group(2):
            href_text, link_text = m.group(2, 3)
            page_name = href_text.strip().lower().replace(' ', '-')
            href = f'/page/{page_name}'
            a_tag = f'<a href="{href}">{link_text}</a>'
            return a_tag
        else:
            page_name = m.group(1).strip().lower().replace(' ', '-')
            href = f'/page/{page_name}'
            a_tag = f'<a href="{href}">{m.group(1)}</a>'
            return a_tag


def to_html(markdown_string):
    infobox, cleaned_markdown = extract_info_box(markdown_string)

    md = markdown.Markdown(
        extensions=[
            TableExtension(),
            CustomWikiLinksExtension(base_url='/page/', end_url=''),
            ExtraExtension(), SaneListExtension()
        ]
    )

    md.postprocessors.register(HeaderAdvancerExtension(), "header_advancer", 0)
    html_output = md.convert(cleaned_markdown)
    table_of_contents = getattr(md, 'table_of_contents', [])

    result = f"""
            <div class="wiki-post">
                {html_output}
            </div>
            """

    return result, table_of_contents, infobox
