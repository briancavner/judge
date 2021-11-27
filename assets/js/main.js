---
js:
    - tester
    - tools
    - audio
    - ui
    - score
    - dialogue
    - desk
    - data
    - init
---

{% for script in page.js %}
    {% include js/{{ script }}.js %}
{% endfor %}