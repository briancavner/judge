---
js:
    - tools
    - ui
    - desk
    - data
    - init
---

{% for script in page.js %}
    {% include js/{{ script }}.js %}
{% endfor %}