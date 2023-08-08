import { ModelInstance, Server } from 'ember-cli-mirage';

import PreprintProvider from 'ember-osf-web/models/preprint-provider';
import User from 'ember-osf-web/models/user';

export function preprintsScenario(
    server: Server,
    currentUser: ModelInstance<User>,
) {
    buildOSF(server, currentUser);
    buildThesisCommons(server, currentUser);
}

function buildOSF(
    server: Server,
    currentUser: ModelInstance<User>,
) {
    const osf = server.schema.preprintProviders.find('osf') as ModelInstance<PreprintProvider>;
    const brand = server.create('brand', {
        primaryColor: '#286090',
        secondaryColor: '#fff',
        heroLogoImage: 'images/default-brand/osf-preprints-white.png',
        heroBackgroundImage: 'images/default-brand/bg-dark.jpg',
    });
    const currentUserModerator = server.create('moderator',
        { id: currentUser.id, user: currentUser, provider: osf }, 'asAdmin');

    const preprints = server.createList('preprint', 4, {
        provider: osf,
    });

    const subjects = server.createList('subject', 7);

    osf.update({
        allowSubmissions: true,
        highlightedSubjects: subjects,
        // eslint-disable-next-line max-len
        advisory_board: '<div class=\'preprint-advisory-header\'>\n<h2>Advisory Group</h2>\n<p>Our advisory group includes leaders in preprints and scholarly communication\n</p></div>\n<div class=\'preprint-advisory-list\'><div class=\'preprint-advisory-list-column\'>\n<ul>\n<li><strong>Devin Berg</strong> : engrXiv, University of Wisconsin-Stout</li>\n<li><strong>Pete Binfield</strong> : PeerJ PrePrints</li>\n<li><strong>Benjamin Brown</strong> : PsyArXiv, Georgia Gwinnett College</li>\n<li><strong>Philip Cohen</strong> : SocArXiv, University of Maryland</li>\n<li><strong>Kathleen Fitzpatrick</strong> : Modern Language Association</li>\n</ul>\n</div>\n<div class=\'preprint-advisory-list-column\'>\n<ul>\n<li><strong>John Inglis</strong> : bioRxiv, Cold Spring Harbor Laboratory Press</li>\n<li><strong>Rebecca Kennison</strong> : K | N Consultants</li>\n<li><strong>Kristen Ratan</strong> : CoKo Foundation</li>\n<li><strong>Oya Riege</strong>r : Ithaka S+R</li>\n<li><strong>Judy Ruttenberg</strong> : SHARE, Association of Research Libraries</li>\n</ul>\n</div>\n</div>',
        brand,
        moderators: [currentUserModerator],
        preprints,
        description: 'This is the description for osf',
        email_support: 'overwritten-email@osf.io',
    });
}

function buildThesisCommons(
    server: Server,
    currentUser: ModelInstance<User>,
) {
    const thesisCommons = server.schema.preprintProviders.find('thesiscommons') as ModelInstance<PreprintProvider>;
    const brand = server.create('brand', {
        primaryColor: '#821e1e',
        secondaryColor: '#94918e',
        heroBackgroundImage: 'https://singlecolorimage.com/get/94918e/1000x1000',
    });
    const currentUserModerator = server.create('moderator',
        { id: currentUser.id, user: currentUser, provider: thesisCommons }, 'asAdmin');

    const preprints = server.createList('preprint', 3, {
        provider: thesisCommons,
    });

    const subjects = server.createList('subject', 2);

    thesisCommons.update({
        highlightedSubjects: subjects,
        brand,
        moderators: [currentUserModerator],
        preprints,
        description: '<p style="color: red">This is the description for Thesis Commons and it has an inline-style!</p>',
        // eslint-disable-next-line max-len
        advisory_board: '<h2><strong>Steering Committee</strong></h2>\n<div class=\'col-xs-6\'>\n<ul>\n<li><strong>Obasegun Ayodele</strong>, Vilsquare.org, Nigeria </li>\n<li><strong>Fayza Mahmoud</strong>, Alexandria University, Egypt</li>\n<li><strong>Johanssen Obanda</strong>, Jabulani Youths for Transformation (JAY4T), Kenya</li>\n<li><strong>Umar Ahmad</strong>, University Putra Malaysia (UPM) and the Malaysia Genome Institute (MGI)</li>\n<li><strong>Michael Cary</strong>, West Virginia University, USA</li>\n<li><strong>Nada Fath</strong>, Mohamed V University &amp; Hassan II Institute of Agronomy and Veterinary Medicine, Rabat, Morocco</li>\n<li><strong>Greg Simpson</strong>, Cranfield University, England &amp; South Africa</li>\n</ul>\n</div>\n<ul>\n<li><strong>Hisham Arafat</strong>, EMEA Applications Consulting, Egypt</li>\n<li><strong>Justin Sègbédji Ahinon</strong>, AfricArXiv co-founder, IGDORE, Bénin</li>\n<li><strong>Mahmoud M Ibrahim</strong>, Uniklinik RWTH Aachen, Germany &amp; Egypt</li>\n<li><strong>Luke Okelo</strong>, Technical University of Kenya </li>\n<li><strong>Ryszard Auksztulewicz</strong>, MPI of Empirical Aesthetics, Germany &amp; City University of Hong Kong</li>\n<li><strong>Osman Aldirdiri</strong>, University of Khartoum, Sudan</li>\n<li><strong>Jo Havemann</strong>, AfricArXiv co-founder, Access 2 Perspectives‘, IGDORE, Germany &amp; Kenya</li>\n</ul>',
    });

    const agrixiv = server.schema.preprintProviders.find('agrixiv') as ModelInstance<PreprintProvider>;
    const agrixivBrand = server.create('brand', {
        primaryColor: '#85BF9B',
        secondaryColor: '#E7F7E1',
        heroBackgroundImage: 'https://singlecolorimage.com/get/E7F7E1/1000x1000',
    });
    agrixiv.update({
        brand: agrixivBrand,
        description: '<p style="color: black">This is the description for agrixiv!</p>',
    });

    const nutrixiv = server.schema.preprintProviders.find('nutrixiv') as ModelInstance<PreprintProvider>;
    const nutrixivBrand = server.create('brand', {
        primaryColor: '#000000',
        secondaryColor: '#888888',
        heroBackgroundImage: 'https://singlecolorimage.com/get/4a4a4a/1000x1000',
    });
    nutrixiv.update({
        brand: nutrixivBrand,
        description: '<p style="color: green">This is the description for nutrixiv!</p>',
    });

    const biohackrxiv = server.schema.preprintProviders.find('biohackrxiv') as ModelInstance<PreprintProvider>;
    const biohackrxivBrand = server.create('brand', {
        primaryColor: '#000000',
        secondaryColor: '#ccc',
        heroBackgroundImage: 'https://singlecolorimage.com/get/ffffff/1000x1000',
    });
    biohackrxiv.update({
        brand: biohackrxivBrand,
        description: '<p style="color: black">This is the description for biohackrxiv!</p>',
    });
}