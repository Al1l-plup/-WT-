"""HTML-страницы (навигация по разделам)."""
from flask import Blueprint, render_template

bp = Blueprint('pages', __name__)


@bp.route('/')
def index(): return render_template('index.html')


@bp.route('/maintenance')
def maintenance(): return render_template('maintenance.html')


@bp.route('/defects')
def defects_page(): return render_template('defects.html')


@bp.route('/analytics')
def analytics_page(): return render_template('analytics.html')


@bp.route('/workers')
def workers_page(): return render_template('workers.html')


@bp.route('/explorer')
def explorer_page(): return render_template('explorer.html')
